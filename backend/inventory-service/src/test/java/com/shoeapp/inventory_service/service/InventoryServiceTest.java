package com.shoeapp.inventory_service.service;

import com.shoeapp.inventory_service.model.Inventory;
import com.shoeapp.inventory_service.repository.InventoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    private InventoryService inventoryService;

    @BeforeEach
    void setUp() {
        inventoryService = new InventoryService(inventoryRepository);
    }

    @Test
    void checkStock_returnsTrue_whenQuantityAboveZero() {
        Inventory inv = new Inventory(1L, "10", 5);
        when(inventoryRepository.findFirstByProductIdAndSize(1L, "10")).thenReturn(Optional.of(inv));

        boolean result = inventoryService.checkStock(1L, "10");

        assertThat(result).isTrue();
    }

    @Test
    void checkStock_returnsFalse_whenQuantityIsZero() {
        Inventory inv = new Inventory(1L, "10", 0);
        when(inventoryRepository.findFirstByProductIdAndSize(1L, "10")).thenReturn(Optional.of(inv));

        boolean result = inventoryService.checkStock(1L, "10");

        assertThat(result).isFalse();
    }

    @Test
    void checkStock_returnsFalse_whenNotFound() {
        when(inventoryRepository.findFirstByProductIdAndSize(1L, "10")).thenReturn(Optional.empty());

        boolean result = inventoryService.checkStock(1L, "10");

        assertThat(result).isFalse();
    }

    @Test
    void updateStock_updatesExistingRecord() {
        Inventory existing = new Inventory(2L, "9", 10);
        when(inventoryRepository.findFirstByProductIdAndSize(2L, "9")).thenReturn(Optional.of(existing));
        when(inventoryRepository.save(existing)).thenReturn(existing);

        Inventory result = inventoryService.updateStock(2L, "9", 20);

        assertThat(result.getQuantity()).isEqualTo(20);
        verify(inventoryRepository).save(existing);
    }

    @Test
    void updateStock_createsNewRecord_whenNotFound() {
        when(inventoryRepository.findFirstByProductIdAndSize(3L, "11")).thenReturn(Optional.empty());
        Inventory newInv = new Inventory(3L, "11", 15);
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(newInv);

        Inventory result = inventoryService.updateStock(3L, "11", 15);

        assertThat(result.getProductId()).isEqualTo(3L);
        assertThat(result.getSize()).isEqualTo("11");
        assertThat(result.getQuantity()).isEqualTo(15);
    }

    @Test
    void reduceStock_decreasesQuantityCorrectly() {
        Inventory inv = new Inventory(4L, "8", 10);
        when(inventoryRepository.findFirstByProductIdAndSize(4L, "8")).thenReturn(Optional.of(inv));
        when(inventoryRepository.save(inv)).thenReturn(inv);

        Inventory result = inventoryService.reduceStock(4L, "8", 3);

        assertThat(result.getQuantity()).isEqualTo(7);
    }

    @Test
    void reduceStock_throwsException_whenInsufficientStock() {
        Inventory inv = new Inventory(4L, "8", 2);
        when(inventoryRepository.findFirstByProductIdAndSize(4L, "8")).thenReturn(Optional.of(inv));

        assertThatThrownBy(() -> inventoryService.reduceStock(4L, "8", 5))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Insufficient stock");
    }

    @Test
    void reduceStock_throwsException_whenNotFound() {
        when(inventoryRepository.findFirstByProductIdAndSize(5L, "7")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> inventoryService.reduceStock(5L, "7", 1))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Inventory not found");
    }

    @Test
    void restoreStock_increasesQuantity_whenRecordExists() {
        Inventory inv = new Inventory(6L, "9", 3);
        when(inventoryRepository.findFirstByProductIdAndSize(6L, "9")).thenReturn(Optional.of(inv));
        when(inventoryRepository.save(inv)).thenReturn(inv);

        Inventory result = inventoryService.restoreStock(6L, "9", 2);

        assertThat(result.getQuantity()).isEqualTo(5);
    }

    @Test
    void restoreStock_createsRecord_whenNotFound() {
        when(inventoryRepository.findFirstByProductIdAndSize(7L, "10")).thenReturn(Optional.empty());
        Inventory newInv = new Inventory(7L, "10", 4);
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(newInv);

        Inventory result = inventoryService.restoreStock(7L, "10", 4);

        assertThat(result.getQuantity()).isEqualTo(4);
    }

    @Test
    void getInventoryByProductId_returnsAllSizes() {
        Inventory inv1 = new Inventory(8L, "9", 5);
        Inventory inv2 = new Inventory(8L, "10", 3);
        when(inventoryRepository.findByProductId(8L)).thenReturn(List.of(inv1, inv2));

        List<Inventory> results = inventoryService.getInventoryByProductId(8L);

        assertThat(results).hasSize(2);
    }
}
