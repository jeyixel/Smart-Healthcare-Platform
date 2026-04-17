package com.smarthealth.admin.config;

import com.smarthealth.admin.model.Role;
import com.smarthealth.admin.model.User;
import com.smarthealth.admin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "admin@smarthealth.com";
        Optional<User> existingAdmin = userRepository.findByEmailIgnoreCase(adminEmail);
        
        if (existingAdmin.isEmpty()) {
            User admin = User.builder()
                    .firstName("Super")
                    .lastName("Admin")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .approved(true)
                    .build();
            userRepository.save(admin);
            System.out.println("Default admin user created: " + adminEmail + " / admin123");
        } else {
            System.out.println("Admin user already exists.");
        }

        // Also create the user's specific email as admin if requested
        String userEmail = "nimnasilva03@gmail.com";
        if (userRepository.findByEmailIgnoreCase(userEmail).isEmpty()) {
             User userAdmin = User.builder()
                    .firstName("Nimna")
                    .lastName("Silva")
                    .email(userEmail)
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.ADMIN)
                    .approved(true)
                    .build();
            userRepository.save(userAdmin);
            System.out.println("Created admin account for: " + userEmail + " / password123");
        }
    }
}
