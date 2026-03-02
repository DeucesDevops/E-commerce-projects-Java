package com.shoeapp.api_gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * JWT Authentication Filter
 *
 * This runs on EVERY request that enters the gateway, before it's forwarded to any service.
 *
 * What it does:
 * 1. Checks if the route is public (e.g., /api/auth/**) — if so, let it through
 * 2. Looks for the "Authorization: Bearer <token>" header
 * 3. Validates the JWT token using the same secret as auth-service
 * 4. Extracts userId and role from the token, adds them as headers
 * 5. Forwards the request to the downstream service
 * 6. Returns 401 Unauthorized if anything is wrong
 */
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    // Routes that don't require a JWT token
    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh"
    );

    @Value("${jwt.secret}")
    private String secret;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // Step 1: Is this a public route? Let it through without checking token
        boolean isPublic = PUBLIC_PATHS.stream().anyMatch(path::startsWith);
        if (isPublic) {
            return chain.filter(exchange);
        }

        // Step 2: Look for the Authorization header
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // No token provided — respond with 401 Unauthorized
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        // Step 3: Extract and validate the token
        // "Bearer eyJhbGci..." → we strip "Bearer " and keep the token
        String token = authHeader.substring(7);

        try {
            SecretKey signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // Step 4: Add userId and role as headers so downstream services
            // know who made the request WITHOUT needing their own JWT logic
            String userId = claims.get("userId", Long.class).toString();
            String role = claims.get("role", String.class);

            ServerWebExchange modifiedExchange = exchange.mutate()
                    .request(r -> r.header("X-User-Id", userId)
                                   .header("X-User-Role", role))
                    .build();

            // Step 5: Forward the modified request to the downstream service
            return chain.filter(modifiedExchange);

        } catch (Exception e) {
            // Token is invalid, expired, or tampered with
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }

    @Override
    public int getOrder() {
        // Run this filter first, before any other gateway filters
        return -1;
    }
}
