package com.shoeapp.payment_service.dto;

/**
 * Published to Kafka after a successful payment.
 * order-service and notification-service will consume this.
 */
public class OrderEvent {

    private Long orderId;
    private Long userId;
    private String customerEmail;
    private String customerName;
    private String status;
    private double totalAmount;

    public OrderEvent() {}

    public OrderEvent(Long orderId, Long userId, String customerEmail,
                      String customerName, String status, double totalAmount) {
        this.orderId = orderId;
        this.userId = userId;
        this.customerEmail = customerEmail;
        this.customerName = customerName;
        this.status = status;
        this.totalAmount = totalAmount;
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
}
