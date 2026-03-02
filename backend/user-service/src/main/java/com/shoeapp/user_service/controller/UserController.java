package com.shoeapp.user_service.controller;

import com.shoeapp.user_service.model.Address;
import com.shoeapp.user_service.model.UserProfile;
import com.shoeapp.user_service.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * All user endpoints.
 *
 * userId, email, and name come from headers set by the api-gateway JWT filter:
 *   X-User-Id   → the user's numeric ID
 *   X-User-Role → "USER" or "ADMIN"
 *
 * We trust these headers because only the api-gateway sets them (after verifying the JWT).
 * End users cannot forge them — they never reach this service directly.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /** GET /api/users/me — get the authenticated user's profile */
    @GetMapping("/me")
    public ResponseEntity<UserProfile> getProfile(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Email", required = false) String email,
            @RequestHeader(value = "X-User-Name", required = false) String name) {
        return ResponseEntity.ok(userService.getOrCreateProfile(userId, email, name));
    }

    /** PUT /api/users/me — update profile fields */
    @PutMapping("/me")
    public ResponseEntity<UserProfile> updateProfile(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody Map<String, String> updates) {
        return ResponseEntity.ok(userService.updateProfile(userId, updates));
    }

    /** GET /api/users/me/addresses — list saved addresses */
    @GetMapping("/me/addresses")
    public ResponseEntity<List<Address>> getAddresses(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(userService.getAddresses(userId));
    }

    /** POST /api/users/me/addresses — add a new address */
    @PostMapping("/me/addresses")
    public ResponseEntity<Address> addAddress(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody Address address) {
        return ResponseEntity.ok(userService.addAddress(userId, address));
    }

    /** PUT /api/users/me/addresses/{id} — update an existing address */
    @PutMapping("/me/addresses/{id}")
    public ResponseEntity<Address> updateAddress(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @RequestBody Address address) {
        return ResponseEntity.ok(userService.updateAddress(userId, id, address));
    }

    /** DELETE /api/users/me/addresses/{id} — delete an address */
    @DeleteMapping("/me/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {
        userService.deleteAddress(userId, id);
        return ResponseEntity.noContent().build();
    }
}
