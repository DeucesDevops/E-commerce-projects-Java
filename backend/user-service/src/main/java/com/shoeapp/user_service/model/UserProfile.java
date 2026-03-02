package com.shoeapp.user_service.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * UserProfile — stores profile information for a user.
 *
 * userId here is the ID from auth-service (the same ID stored in the JWT).
 * We do NOT duplicate the password or email here — auth-service owns that data.
 */
@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Links this profile to the auth-service user
    @Column(nullable = false, unique = true)
    private Long userId;

    private String name;
    private String email;
    private String phone;
    private String avatarUrl;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
