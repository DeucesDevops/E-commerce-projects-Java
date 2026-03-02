package com.shoeapp.cart_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shoeapp.cart_service.model.CartItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * CartService — all the logic for reading and writing cart data in Redis.
 *
 * Redis data structure used:
 *   Key:      "cart:42"           (one key per user)
 *   Type:     Hash
 *   Fields:   "101:size-10"  →  { CartItem JSON }
 *             "205:size-9"   →  { CartItem JSON }
 *
 * The field name is "productId:size" — this way a user can have the same
 * shoe in two different sizes as separate cart items.
 */
@Service
public class CartService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${cart.ttl-seconds}")
    private long cartTtlSeconds;

    public CartService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = new ObjectMapper();
    }

    // Redis key for a user's cart: "cart:42"
    private String cartKey(String userId) {
        return "cart:" + userId;
    }

    // Field name inside the hash: "101:size-10"
    private String itemField(Long productId, String size) {
        return productId + ":size-" + size;
    }

    /** Get all items in the user's cart */
    public List<CartItem> getCart(String userId) {
        Map<Object, Object> entries = redisTemplate.opsForHash().entries(cartKey(userId));
        List<CartItem> items = new ArrayList<>();
        for (Object value : entries.values()) {
            items.add(objectMapper.convertValue(value, CartItem.class));
        }
        return items;
    }

    /** Add an item to the cart, or increment its quantity if it already exists */
    public void addItem(String userId, CartItem item) {
        String key = cartKey(userId);
        String field = itemField(item.getProductId(), item.getSize());

        Object existing = redisTemplate.opsForHash().get(key, field);
        if (existing != null) {
            // Item already in cart — increment quantity
            CartItem existingItem = objectMapper.convertValue(existing, CartItem.class);
            existingItem.setQuantity(existingItem.getQuantity() + item.getQuantity());
            redisTemplate.opsForHash().put(key, field, existingItem);
        } else {
            // New item — add it
            redisTemplate.opsForHash().put(key, field, item);
        }

        // Refresh TTL every time the cart is touched (7 days from last activity)
        redisTemplate.expire(key, cartTtlSeconds, TimeUnit.SECONDS);
    }

    /** Update quantity for a specific item */
    public void updateItem(String userId, Long productId, String size, int quantity) {
        String key = cartKey(userId);
        String field = itemField(productId, size);

        Object existing = redisTemplate.opsForHash().get(key, field);
        if (existing != null) {
            CartItem item = objectMapper.convertValue(existing, CartItem.class);
            item.setQuantity(quantity);
            redisTemplate.opsForHash().put(key, field, item);
            redisTemplate.expire(key, cartTtlSeconds, TimeUnit.SECONDS);
        }
    }

    /** Remove one item from the cart */
    public void removeItem(String userId, Long productId, String size) {
        redisTemplate.opsForHash().delete(cartKey(userId), itemField(productId, size));
    }

    /** Remove all items from the cart */
    public void clearCart(String userId) {
        redisTemplate.delete(cartKey(userId));
    }
}
