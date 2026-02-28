package com.shoeapp.inventory_service.repository;

import com.shoeapp.inventory_service.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    List<Inventory> findByProductId(Long productId);

    List<Inventory> findByProductIdAndSize(Long productId, String size);

    Optional<Inventory> findFirstByProductIdAndSize(Long productId, String size);
}
