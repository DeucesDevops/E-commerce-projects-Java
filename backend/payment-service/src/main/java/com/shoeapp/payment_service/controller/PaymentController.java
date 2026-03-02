package com.shoeapp.payment_service.controller;

import com.shoeapp.payment_service.model.Payment;
import com.shoeapp.payment_service.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * POST /api/payments/create-intent
     * Frontend calls this first. Returns a clientSecret for Stripe.js.
     *
     * Request body: { "orderId": 5, "amount": 120.00 }
     * Response:     { "clientSecret": "pi_3N...secret..." }
     */
    @PostMapping("/create-intent")
    public ResponseEntity<Map<String, String>> createIntent(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody Map<String, Object> body) throws Exception {
        Long orderId = Long.valueOf(body.get("orderId").toString());
        double amount = Double.parseDouble(body.get("amount").toString());
        String clientSecret = paymentService.createPaymentIntent(orderId, userId, amount);
        return ResponseEntity.ok(Map.of("clientSecret", clientSecret));
    }

    /**
     * POST /api/payments/confirm
     * Called after the user successfully enters their card in Stripe's UI.
     *
     * Request body: { "paymentIntentId": "pi_3N...", "customerEmail": "...", "customerName": "..." }
     */
    @PostMapping("/confirm")
    public ResponseEntity<Payment> confirm(
            @RequestBody Map<String, String> body) {
        Payment payment = paymentService.confirmPayment(
                body.get("paymentIntentId"),
                body.get("customerEmail"),
                body.get("customerName")
        );
        return ResponseEntity.ok(payment);
    }

    /**
     * GET /api/payments/order/{orderId}
     * Check the payment status for a given order.
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<Payment> getByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentByOrder(orderId));
    }
}
