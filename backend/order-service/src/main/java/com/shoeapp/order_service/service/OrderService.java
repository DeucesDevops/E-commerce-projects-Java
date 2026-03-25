package com.shoeapp.order_service.service;

import com.shoeapp.order_service.dto.OrderEvent;
import com.shoeapp.order_service.model.Order;
import com.shoeapp.order_service.repository.OrderRepository;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public OrderService(OrderRepository orderRepository,
                        KafkaTemplate<String, Object> kafkaTemplate) {
        this.orderRepository = orderRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    public Order createOrder(Order order) {
        Order saved = orderRepository.save(order);

        OrderEvent event = new OrderEvent(
                saved.getId(),
                saved.getUserId(),
                saved.getCustomerEmail(),
                saved.getCustomerName(),
                "CREATED",
                saved.getTotalAmount() != null ? saved.getTotalAmount().doubleValue() : 0.0,
                saved.getItems()
        );
        kafkaTemplate.send("order.created", event);

        return saved;
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Order order = getOrderById(orderId);
        order.setStatus(status);
        Order saved = orderRepository.save(order);

        if ("SHIPPED".equals(status) || "DELIVERED".equals(status)) {
            OrderEvent event = new OrderEvent(
                    saved.getId(),
                    saved.getUserId(),
                    saved.getCustomerEmail(),
                    saved.getCustomerName(),
                    status,
                    saved.getTotalAmount() != null ? saved.getTotalAmount().doubleValue() : 0.0,
                    null
            );
            kafkaTemplate.send("order.status.updated", event);
        }

        return saved;
    }

    public Order cancelOrder(Long orderId) {
        Order order = getOrderById(orderId);

        if (!"CREATED".equals(order.getStatus()) && !"PAID".equals(order.getStatus())) {
            throw new RuntimeException(
                    "Order " + orderId + " cannot be cancelled in status: " + order.getStatus());
        }

        order.setStatus("CANCELLED");
        Order saved = orderRepository.save(order);

        OrderEvent event = new OrderEvent(
                saved.getId(),
                saved.getUserId(),
                saved.getCustomerEmail(),
                saved.getCustomerName(),
                "CANCELLED",
                saved.getTotalAmount() != null ? saved.getTotalAmount().doubleValue() : 0.0,
                saved.getItems()
        );
        kafkaTemplate.send("order.cancelled", event);

        return saved;
    }
}
