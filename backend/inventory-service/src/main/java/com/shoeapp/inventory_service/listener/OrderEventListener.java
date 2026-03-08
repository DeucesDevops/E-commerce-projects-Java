package com.shoeapp.inventory_service.listener;

import com.shoeapp.inventory_service.dto.OrderEvent;
import com.shoeapp.inventory_service.service.InventoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Listens for order lifecycle events from Kafka and adjusts inventory accordingly.
 *
 * order.created → reduce stock for each item in the order
 * order.cancelled → restore stock for each item in the order
 */
@Component
public class OrderEventListener {

    private static final Logger log = LoggerFactory.getLogger(OrderEventListener.class);

    private final InventoryService inventoryService;

    public OrderEventListener(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @KafkaListener(topics = "order.created", groupId = "inventory-service-group")
    public void onOrderCreated(OrderEvent event) {
        if (event.getItems() == null || event.getItems().isEmpty()) {
            return;
        }
        for (OrderEvent.OrderItemEvent item : event.getItems()) {
            try {
                inventoryService.reduceStock(item.getProductId(), item.getSize(), item.getQuantity());
                log.info("Reduced stock for productId={} size={} qty={} (order {})",
                        item.getProductId(), item.getSize(), item.getQuantity(), event.getOrderId());
            } catch (Exception e) {
                log.error("Failed to reduce stock for productId={} size={} (order {}): {}",
                        item.getProductId(), item.getSize(), event.getOrderId(), e.getMessage());
            }
        }
    }

    @KafkaListener(topics = "order.cancelled", groupId = "inventory-service-group")
    public void onOrderCancelled(OrderEvent event) {
        if (event.getItems() == null || event.getItems().isEmpty()) {
            return;
        }
        for (OrderEvent.OrderItemEvent item : event.getItems()) {
            try {
                inventoryService.restoreStock(item.getProductId(), item.getSize(), item.getQuantity());
                log.info("Restored stock for productId={} size={} qty={} (order {} cancelled)",
                        item.getProductId(), item.getSize(), item.getQuantity(), event.getOrderId());
            } catch (Exception e) {
                log.error("Failed to restore stock for productId={} size={} (order {}): {}",
                        item.getProductId(), item.getSize(), event.getOrderId(), e.getMessage());
            }
        }
    }
}
