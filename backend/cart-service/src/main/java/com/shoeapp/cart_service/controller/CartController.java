package com.shoeapp.cart_service.controller;

import com.shoeapp.cart_service.model.CartItem;
import com.shoeapp.cart_service.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * CartController — REST endpoints for cart operations.
 *
 * IMPORTANT: userId is NOT taken from the request body or a login form.
 * It comes from the "X-User-Id" header, which the api-gateway adds automatically
 * after validating the JWT token. This is the secure pattern — the service
 * trusts the gateway, not the client.
 */
@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    /** GET /api/cart — return all items in the user's cart */
    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    /** POST /api/cart/add — add an item (or increment quantity if it exists) */
    @PostMapping("/add")
    public ResponseEntity<Void> addItem(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody CartItem item) {
        cartService.addItem(userId, item);
        return ResponseEntity.ok().build();
    }

    /** PUT /api/cart/update — update quantity of a specific item */
    @PutMapping("/update")
    public ResponseEntity<Void> updateItem(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody Map<String, Object> body) {
        Long productId = Long.valueOf(body.get("productId").toString());
        String size = body.get("size").toString();
        int quantity = Integer.parseInt(body.get("quantity").toString());
        cartService.updateItem(userId, productId, size, quantity);
        return ResponseEntity.ok().build();
    }

    /** DELETE /api/cart/remove — remove one item from the cart */
    @DeleteMapping("/remove")
    public ResponseEntity<Void> removeItem(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam Long productId,
            @RequestParam String size) {
        cartService.removeItem(userId, productId, size);
        return ResponseEntity.ok().build();
    }

    /** DELETE /api/cart/clear — empty the entire cart */
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(
            @RequestHeader("X-User-Id") String userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok().build();
    }
}
