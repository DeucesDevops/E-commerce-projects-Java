package com.shoeapp.order_service.controller;

import com.shoeapp.order_service.model.Order;
import com.shoeapp.order_service.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        Order createdOrder = orderService.createOrder(order);
        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable Long userId) {
        List<Order> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        Order updatedOrder = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(updatedOrder);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable Long id) {
        Order cancelledOrder = orderService.cancelOrder(id);
        return ResponseEntity.ok(cancelledOrder);
    }
}
