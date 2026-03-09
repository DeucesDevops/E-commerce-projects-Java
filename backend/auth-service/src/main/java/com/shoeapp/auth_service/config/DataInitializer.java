package com.shoeapp.auth_service.config;

import com.shoeapp.auth_service.model.User;
import com.shoeapp.auth_service.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public DataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            System.out.println("Users already seeded — skipping.");
            return;
        }

        // Admin user
        User admin = new User();
        admin.setName("Admin");
        admin.setEmail("admin@shoeapp.com");
        admin.setPassword(passwordEncoder.encode("Admin1234!"));
        admin.setRole("ADMIN");
        userRepository.save(admin);

        // Regular test user
        User user = new User();
        user.setName("Test User");
        user.setEmail("user@shoeapp.com");
        user.setPassword(passwordEncoder.encode("User1234!"));
        user.setRole("USER");
        userRepository.save(user);

        System.out.println("Seeded 2 users: admin@shoeapp.com (ADMIN) and user@shoeapp.com (USER)");
    }
}
