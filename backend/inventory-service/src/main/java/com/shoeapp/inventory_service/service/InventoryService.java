package com.shoeapp.inventory_service.service;

import com.shoeapp.inventory_service.model.Inventory;
import com.shoeapp.inventory_service.repository.InventoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public List<Inventory> getInventoryByProductId(Long productId) {
        return inventoryRepository.findByProductId(productId);
    }

    public boolean checkStock(Long productId, String size) {
        Optional<Inventory> inventory = inventoryRepository.findFirstByProductIdAndSize(productId, size);
        return inventory.isPresent() && inventory.get().getQuantity() > 0;
    }

    public Inventory updateStock(Long productId, String size, Integer quantity) {
        Optional<Inventory> existing = inventoryRepository.findFirstByProductIdAndSize(productId, size);
        if (existing.isPresent()) {
            Inventory inventory = existing.get();
            inventory.setQuantity(quantity);
            return inventoryRepository.save(inventory);
        } else {
            Inventory inventory = new Inventory(productId, size, quantity);
            return inventoryRepository.save(inventory);
        }
    }

    public Inventory restoreStock(Long productId, String size, Integer amount) {
        Optional<Inventory> existing = inventoryRepository.findFirstByProductIdAndSize(productId, size);
        if (existing.isPresent()) {
            Inventory inventory = existing.get();
            inventory.setQuantity(inventory.getQuantity() + amount);
            return inventoryRepository.save(inventory);
        } else {
            Inventory inventory = new Inventory(productId, size, amount);
            return inventoryRepository.save(inventory);
        }
    }

    public Inventory reduceStock(Long productId, String size, Integer amount) {
        Inventory inventory = inventoryRepository.findFirstByProductIdAndSize(productId, size)
                .orElseThrow(() -> new RuntimeException(
                        "Inventory not found for productId: " + productId + " and size: " + size));

        if (inventory.getQuantity() < amount) {
            throw new RuntimeException(
                    "Insufficient stock for productId: " + productId + ", size: " + size
                            + ". Available: " + inventory.getQuantity() + ", requested: " + amount);
        }

        inventory.setQuantity(inventory.getQuantity() - amount);
        return inventoryRepository.save(inventory);
    }
}
