package com.shoeapp.inventory_service.controller;

import com.shoeapp.inventory_service.model.Inventory;
import com.shoeapp.inventory_service.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/{productId}")
    public ResponseEntity<List<Inventory>> getInventoryByProductId(@PathVariable Long productId) {
        List<Inventory> inventory = inventoryService.getInventoryByProductId(productId);
        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/{productId}/check")
    public ResponseEntity<Boolean> checkStock(@PathVariable Long productId, @RequestParam String size) {
        boolean inStock = inventoryService.checkStock(productId, size);
        return ResponseEntity.ok(inStock);
    }

    @PutMapping("/{productId}")
    public ResponseEntity<Inventory> updateStock(@PathVariable Long productId,
                                                  @RequestBody Map<String, Object> request) {
        String size = (String) request.get("size");
        Integer quantity = (Integer) request.get("quantity");
        Inventory updated = inventoryService.updateStock(productId, size, quantity);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{productId}/reduce")
    public ResponseEntity<Inventory> reduceStock(@PathVariable Long productId,
                                                  @RequestBody Map<String, Object> request) {
        String size = (String) request.get("size");
        Integer amount = (Integer) request.get("amount");
        Inventory reduced = inventoryService.reduceStock(productId, size, amount);
        return ResponseEntity.ok(reduced);
    }
}
