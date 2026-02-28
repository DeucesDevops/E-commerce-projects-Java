package com.shoeapp.inventory_service.config;

import com.shoeapp.inventory_service.model.Inventory;
import com.shoeapp.inventory_service.repository.InventoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
public class DataInitializer implements CommandLineRunner {

    private final InventoryRepository inventoryRepository;

    public DataInitializer(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    @Override
    public void run(String... args) {
        if (inventoryRepository.count() > 0) {
            return;
        }

        Random random = new Random();

        for (long productId = 1; productId <= 12; productId++) {
            for (int size = 7; size <= 12; size++) {
                int quantity = random.nextInt(21) + 5; // random between 5 and 25
                Inventory inventory = new Inventory(productId, String.valueOf(size), quantity);
                inventoryRepository.save(inventory);
            }
        }

        System.out.println("Inventory data initialized: 12 products x 6 sizes = "
                + inventoryRepository.count() + " entries");
    }
}
