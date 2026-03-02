package com.shoeapp.notification_service.dto;

/**
 * Represents the data published by order-service to Kafka.
 * notification-service deserializes incoming Kafka messages into this object.
 *
 * Must match the structure that order-service publishes.
 */
public class OrderEvent {

    private Long orderId;
    private Long userId;
    private String customerEmail;
    private String customerName;
    private String status;      // CREATED, PAID, SHIPPED, DELIVERED, CANCELLED
    private double totalAmount;

    public OrderEvent() {}

    // Getters and setters

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
}
