package com.shoeapp.order_service.dto;

import com.shoeapp.order_service.model.OrderItem;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Published to Kafka after order lifecycle events.
 * Consumed by inventory-service (for stock updates) and notification-service (for emails).
 */
public class OrderEvent {

    private Long orderId;
    private Long userId;
    private String customerEmail;
    private String customerName;
    private String status;      // CREATED, CANCELLED, SHIPPED, DELIVERED
    private double totalAmount;
    private List<OrderItemEvent> items;

    public OrderEvent() {}

    public OrderEvent(Long orderId, Long userId, String customerEmail,
                      String customerName, String status, double totalAmount,
                      List<OrderItem> orderItems) {
        this.orderId = orderId;
        this.userId = userId;
        this.customerEmail = customerEmail;
        this.customerName = customerName;
        this.status = status;
        this.totalAmount = totalAmount;
        if (orderItems != null) {
            this.items = orderItems.stream()
                    .map(item -> new OrderItemEvent(item.getProductId(), item.getSize(), item.getQuantity()))
                    .collect(Collectors.toList());
        }
    }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public List<OrderItemEvent> getItems() { return items; }
    public void setItems(List<OrderItemEvent> items) { this.items = items; }

    public static class OrderItemEvent {
        private Long productId;
        private String size;
        private Integer quantity;

        public OrderItemEvent() {}

        public OrderItemEvent(Long productId, String size, Integer quantity) {
            this.productId = productId;
            this.size = size;
            this.quantity = quantity;
        }

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public String getSize() { return size; }
        public void setSize(String size) { this.size = size; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}
