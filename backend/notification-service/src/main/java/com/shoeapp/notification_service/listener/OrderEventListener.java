package com.shoeapp.notification_service.listener;

import com.shoeapp.notification_service.dto.OrderEvent;
import com.shoeapp.notification_service.service.EmailService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * OrderEventListener — subscribes to Kafka topics and reacts to order events.
 *
 * @KafkaListener tells Spring: "call this method whenever a message arrives
 * on this Kafka topic". The message is automatically deserialized from JSON
 * into an OrderEvent object.
 *
 * groupId = "notification-service-group" means:
 * - Each message is delivered to exactly one consumer in this group
 * - If you scale to 3 instances of notification-service, Kafka will
 *   distribute messages between them (each message processed only once)
 */
@Component
public class OrderEventListener {

    private final EmailService emailService;

    public OrderEventListener(EmailService emailService) {
        this.emailService = emailService;
    }

    @KafkaListener(topics = "order.created", groupId = "notification-service-group")
    public void onOrderCreated(OrderEvent event) {
        emailService.sendOrderConfirmation(event);
    }

    @KafkaListener(topics = "order.paid", groupId = "notification-service-group")
    public void onOrderPaid(OrderEvent event) {
        emailService.sendPaymentConfirmation(event);
    }

    @KafkaListener(topics = "order.status.updated", groupId = "notification-service-group")
    public void onOrderStatusUpdated(OrderEvent event) {
        // React differently based on the new status
        if ("SHIPPED".equals(event.getStatus())) {
            emailService.sendShippingNotification(event);
        } else if ("DELIVERED".equals(event.getStatus())) {
            emailService.sendDeliveryConfirmation(event);
        }
    }

    @KafkaListener(topics = "order.cancelled", groupId = "notification-service-group")
    public void onOrderCancelled(OrderEvent event) {
        emailService.sendCancellationNotice(event);
    }
}
