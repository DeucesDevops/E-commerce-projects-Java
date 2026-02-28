package com.shoeapp.auth_service.controller;

import com.shoeapp.auth_service.dto.AuthResponse;
import com.shoeapp.auth_service.dto.LoginRequest;
import com.shoeapp.auth_service.dto.RegisterRequest;
import com.shoeapp.auth_service.service.AuthService;
import com.shoeapp.auth_service.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestParam String token) {
        try {
            Claims claims = jwtUtil.validateToken(token);
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("userId", claims.get("userId", Long.class));
            userInfo.put("email", claims.getSubject());
            userInfo.put("role", claims.get("role", String.class));
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
        }
    }
}
