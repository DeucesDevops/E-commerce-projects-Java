package com.shoeapp.payment_service.service;

import com.shoeapp.payment_service.dto.OrderEvent;
import com.shoeapp.payment_service.model.Payment;
import com.shoeapp.payment_service.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    public PaymentService(PaymentRepository paymentRepository,
                          KafkaTemplate<String, Object> kafkaTemplate) {
        this.paymentRepository = paymentRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    // @PostConstruct runs once after Spring creates this bean
    // Sets the global Stripe API key so all Stripe calls are authenticated
    @PostConstruct
    public void initStripe() {
        Stripe.apiKey = stripeSecretKey;
    }

    /**
     * Step 1 of payment flow:
     * Create a Stripe PaymentIntent and return the clientSecret to the frontend.
     * The frontend uses the clientSecret to show Stripe's card input form.
     *
     * @return clientSecret (a string the frontend passes to Stripe.js)
     */
    public String createPaymentIntent(Long orderId, Long userId, double amount) throws Exception {
        // Stripe amounts are in the smallest currency unit
        // $120.00 → 12000 cents
        long amountInCents = Math.round(amount * 100);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("usd")
                .putMetadata("orderId", orderId.toString())
                .putMetadata("userId", userId.toString())
                .build();

        PaymentIntent intent = PaymentIntent.create(params);

        // Save to DB so we can look up this payment later
        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setUserId(userId);
        payment.setAmount(amount);
        payment.setStripePaymentIntentId(intent.getId());
        payment.setStatus("PENDING");
        paymentRepository.save(payment);

        // Return the clientSecret — frontend needs this to complete payment
        return intent.getClientSecret();
    }

    /**
     * Step 2 of payment flow:
     * Called by the frontend after Stripe confirms the payment.
     * We mark the payment as completed and publish an event.
     */
    public Payment confirmPayment(String paymentIntentId, String customerEmail, String customerName) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus("COMPLETED");
        Payment saved = paymentRepository.save(payment);

        // Tell the rest of the system that this order is paid
        OrderEvent event = new OrderEvent(
                payment.getOrderId(),
                payment.getUserId(),
                customerEmail,
                customerName,
                "PAID",
                payment.getAmount()
        );
        kafkaTemplate.send("order.paid", event);

        return saved;
    }

    public Payment getPaymentByOrder(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("No payment found for order " + orderId));
    }
}
