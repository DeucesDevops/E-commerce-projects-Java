import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { CheckCircle, CreditCard, ArrowLeft } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrder, createPaymentIntent, confirmPayment } from '../services/api'

// loadStripe is called once at module level — never inside a component
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '')

// ─── PaymentForm ────────────────────────────────────────────────────────────
// This must be a separate component because useStripe() and useElements()
// only work inside a component that is rendered inside <Elements>.
function PaymentForm({
  orderId,
  customerEmail,
  customerName,
  onSuccess,
}: {
  orderId: number
  customerEmail: string
  customerName: string
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setError('')
    setPaying(true)

    // Step 1: Ask Stripe to charge the card
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: 'if_required', // stay on page — no redirect
    })

    if (result.error) {
      setError(result.error.message ?? 'Payment failed. Please try again.')
      setPaying(false)
      return
    }

    // Step 2: Tell our backend the payment succeeded so it can update
    // the order status and publish the order.paid Kafka event
    try {
      await confirmPayment(result.paymentIntent.id, customerEmail, customerName)
    } catch {
      // Stripe already charged — backend will reconcile via webhook in production
      console.error('Backend confirmation failed for intent', result.paymentIntent.id)
    }

    onSuccess()
  }

  return (
    <form onSubmit={handlePay} className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </h2>
        {/* Stripe renders the card input — no card data ever touches our server */}
        <PaymentElement />
      </div>

      {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

      <button
        type="submit"
        disabled={paying || !stripe}
        className="w-full px-8 py-4 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
      >
        {paying ? 'Processing Payment...' : 'Pay Now'}
      </button>
    </form>
  )
}

// ─── CheckoutPage ────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCart()
  const { user } = useAuth()

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    street: '',
    city: '',
    state: '',
    zip: '',
  })

  // Three stages: fill shipping → pay → done
  const [stage, setStage] = useState<'shipping' | 'payment' | 'success'>('shipping')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [orderId, setOrderId] = useState(0)

  if (cart.length === 0 && stage !== 'success') {
    return <Navigate to="/cart" replace />
  }

  const subtotal = getCartTotal()
  const shipping = subtotal >= 100 ? 0 : 9.99
  const total = subtotal + shipping

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Stage 1: validate shipping form → create order → create payment intent
  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.street || !form.city || !form.state || !form.zip) {
      setError('Please fill in all fields.')
      return
    }

    setSubmitting(true)
    try {
      const order = await createOrder({
        userId: user?.id ?? 0,
        customerName: form.name,
        customerEmail: form.email,
        shippingAddress: `${form.street}, ${form.city}, ${form.state} ${form.zip}`,
        totalAmount: total,
        items: cart.map((item) => ({
          id: 0,
          productId: item.product.id,
          productName: item.product.name,
          size: item.selectedSize,
          color: item.selectedColor,
          quantity: item.quantity,
          price: item.product.price,
        })),
      })

      // Get the clientSecret Stripe needs to render its payment form
      const secret = await createPaymentIntent(order.id, total)
      setOrderId(order.id)
      setClientSecret(secret)
      setStage('payment')
    } catch {
      setError('Could not create order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentSuccess = () => {
    clearCart()
    setStage('success')
  }

  // ── Success ──────────────────────────────────────────────────────
  if (stage === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
        <h1 className="mt-6 text-3xl font-bold text-gray-900">Payment Confirmed!</h1>
        <p className="mt-3 text-gray-500">
          Thank you, {form.name}. Order #{orderId} is confirmed and a receipt has been sent to{' '}
          {form.email}.
        </p>
        <Link
          to="/orders"
          className="mt-8 inline-flex items-center px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors"
        >
          View My Orders
        </Link>
      </div>
    )
  }

  // ── Shared order summary sidebar ─────────────────────────────────
  const orderSummary = (
    <div className="bg-gray-50 rounded-xl p-6 sticky top-24">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
      <div className="space-y-3 mb-4">
        {cart.map((item) => (
          <div
            key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
            className="flex justify-between text-sm"
          >
            <div className="text-gray-600">
              <p className="font-medium text-gray-900">{item.product.name}</p>
              <p>
                Size {item.selectedSize} / {item.selectedColor} &times; {item.quantity}
              </p>
            </div>
            <span className="font-medium text-gray-900">
              ${(item.product.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 flex justify-between text-gray-900 font-semibold text-base">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">

          {/* ── Stage 1: Shipping form ── */}
          {stage === 'shipping' && (
            <form onSubmit={handleShippingSubmit} className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      id="name" name="name" type="text" value={form.name} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email" name="email" type="email" value={form.email} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      id="street" name="street" type="text" value={form.street} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="123 Main St"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        id="city" name="city" type="text" value={form.city} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        id="state" name="state" type="text" value={form.state} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                      <input
                        id="zip" name="zip" type="text" value={form.zip} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="10001"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-8 py-4 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {submitting ? 'Creating Order...' : 'Continue to Payment'}
              </button>
            </form>
          )}

          {/* ── Stage 2: Stripe payment form ── */}
          {stage === 'payment' && clientSecret && (
            <div className="space-y-4">
              <button
                onClick={() => setStage('shipping')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to shipping
              </button>
              {/* <Elements> provides the Stripe context that PaymentForm needs */}
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm
                  orderId={orderId}
                  customerEmail={form.email}
                  customerName={form.name}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">{orderSummary}</div>
      </div>
    </div>
  )
}
