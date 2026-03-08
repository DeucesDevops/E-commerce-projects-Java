package com.shoeapp.order_service.service;

import com.shoeapp.order_service.model.Order;
import com.shoeapp.order_service.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(orderRepository, kafkaTemplate);
    }

    @Test
    void createOrder_savesOrderAndPublishesEvent() {
        Order order = new Order();
        order.setUserId(1L);
        order.setCustomerEmail("test@example.com");
        order.setCustomerName("Test User");
        order.setTotalAmount(new BigDecimal("99.99"));
        order.setItems(List.of());

        Order saved = new Order();
        saved.setId(10L);
        saved.setUserId(1L);
        saved.setCustomerEmail("test@example.com");
        saved.setCustomerName("Test User");
        saved.setTotalAmount(new BigDecimal("99.99"));
        saved.setStatus("PENDING");
        saved.setItems(List.of());

        when(orderRepository.save(order)).thenReturn(saved);

        Order result = orderService.createOrder(order);

        assertThat(result.getId()).isEqualTo(10L);
        verify(kafkaTemplate).send(eq("order.created"), any());
    }

    @Test
    void getOrderById_returnsOrder_whenFound() {
        Order order = new Order();
        order.setId(5L);
        when(orderRepository.findById(5L)).thenReturn(Optional.of(order));

        Order result = orderService.getOrderById(5L);

        assertThat(result.getId()).isEqualTo(5L);
    }

    @Test
    void getOrderById_throwsException_whenNotFound() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.getOrderById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Order not found with id: 99");
    }

    @Test
    void updateOrderStatus_toShipped_publishesStatusEvent() {
        Order order = new Order();
        order.setId(1L);
        order.setUserId(2L);
        order.setStatus("PAID");
        order.setTotalAmount(new BigDecimal("50.00"));

        Order saved = new Order();
        saved.setId(1L);
        saved.setUserId(2L);
        saved.setStatus("SHIPPED");
        saved.setTotalAmount(new BigDecimal("50.00"));

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(saved);

        Order result = orderService.updateOrderStatus(1L, "SHIPPED");

        assertThat(result.getStatus()).isEqualTo("SHIPPED");
        verify(kafkaTemplate).send(eq("order.status.updated"), any());
    }

    @Test
    void updateOrderStatus_toProcessing_doesNotPublishEvent() {
        Order order = new Order();
        order.setId(1L);
        order.setStatus("PAID");
        order.setTotalAmount(new BigDecimal("50.00"));

        Order saved = new Order();
        saved.setId(1L);
        saved.setStatus("PROCESSING");
        saved.setTotalAmount(new BigDecimal("50.00"));

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(saved);

        orderService.updateOrderStatus(1L, "PROCESSING");

        verify(kafkaTemplate, never()).send(eq("order.status.updated"), any());
    }

    @Test
    void cancelOrder_cancelsCreatedOrder_andPublishesEvent() {
        Order order = new Order();
        order.setId(3L);
        order.setUserId(1L);
        order.setStatus("CREATED");
        order.setTotalAmount(new BigDecimal("75.00"));
        order.setItems(List.of());

        Order saved = new Order();
        saved.setId(3L);
        saved.setUserId(1L);
        saved.setStatus("CANCELLED");
        saved.setTotalAmount(new BigDecimal("75.00"));
        saved.setItems(List.of());

        when(orderRepository.findById(3L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(saved);

        Order result = orderService.cancelOrder(3L);

        assertThat(result.getStatus()).isEqualTo("CANCELLED");
        verify(kafkaTemplate).send(eq("order.cancelled"), any());
    }

    @Test
    void cancelOrder_throwsException_whenOrderAlreadyShipped() {
        Order order = new Order();
        order.setId(4L);
        order.setStatus("SHIPPED");

        when(orderRepository.findById(4L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.cancelOrder(4L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("cannot be cancelled in status: SHIPPED");

        verify(kafkaTemplate, never()).send(any(), any());
    }

    @Test
    void getOrdersByUserId_returnsUserOrders() {
        Order o1 = new Order();
        o1.setUserId(7L);
        Order o2 = new Order();
        o2.setUserId(7L);

        when(orderRepository.findByUserIdOrderByCreatedAtDesc(7L)).thenReturn(List.of(o1, o2));

        List<Order> results = orderService.getOrdersByUserId(7L);

        assertThat(results).hasSize(2);
    }
}
