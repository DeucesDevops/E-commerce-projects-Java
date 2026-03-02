package com.shoeapp.notification_service.service;

import com.shoeapp.notification_service.dto.OrderEvent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * EmailService — sends HTML emails using Spring's JavaMailSender.
 *
 * In a real app you'd use Thymeleaf templates for beautiful HTML emails.
 * Here we use simple inline HTML to keep it clear.
 */
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${notification.from-email}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOrderConfirmation(OrderEvent event) {
        String subject = "Order Confirmed - #" + event.getOrderId();
        String body = "<h2>Hi " + event.getCustomerName() + ",</h2>"
                + "<p>Your order <strong>#" + event.getOrderId() + "</strong> has been placed successfully.</p>"
                + "<p>Total: <strong>$" + event.getTotalAmount() + "</strong></p>"
                + "<p>We'll send you another email when your order ships.</p>"
                + "<br><p>Thank you for shopping with ShoeApp!</p>";
        sendHtmlEmail(event.getCustomerEmail(), subject, body);
    }

    public void sendPaymentConfirmation(OrderEvent event) {
        String subject = "Payment Confirmed - Order #" + event.getOrderId();
        String body = "<h2>Hi " + event.getCustomerName() + ",</h2>"
                + "<p>Payment for order <strong>#" + event.getOrderId() + "</strong> has been confirmed.</p>"
                + "<p>Your order is now being prepared. We'll notify you when it ships.</p>";
        sendHtmlEmail(event.getCustomerEmail(), subject, body);
    }

    public void sendShippingNotification(OrderEvent event) {
        String subject = "Your order is on the way! - #" + event.getOrderId();
        String body = "<h2>Hi " + event.getCustomerName() + ",</h2>"
                + "<p>Great news! Order <strong>#" + event.getOrderId() + "</strong> has been shipped.</p>"
                + "<p>You should receive it within 3-5 business days.</p>";
        sendHtmlEmail(event.getCustomerEmail(), subject, body);
    }

    public void sendDeliveryConfirmation(OrderEvent event) {
        String subject = "Order Delivered - #" + event.getOrderId();
        String body = "<h2>Hi " + event.getCustomerName() + ",</h2>"
                + "<p>Your order <strong>#" + event.getOrderId() + "</strong> has been delivered!</p>"
                + "<p>We hope you love your new shoes. Leave a review to help other customers.</p>";
        sendHtmlEmail(event.getCustomerEmail(), subject, body);
    }

    public void sendCancellationNotice(OrderEvent event) {
        String subject = "Order Cancelled - #" + event.getOrderId();
        String body = "<h2>Hi " + event.getCustomerName() + ",</h2>"
                + "<p>Your order <strong>#" + event.getOrderId() + "</strong> has been cancelled.</p>"
                + "<p>If you paid, a refund will be processed within 3-5 business days.</p>";
        sendHtmlEmail(event.getCustomerEmail(), subject, body);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML content
            mailSender.send(message);
        } catch (MessagingException e) {
            // Log the error but don't crash the service — email failure shouldn't break order flow
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }
}
