package com.landuse.app.config;

import com.landuse.app.entity.User;
import com.landuse.app.enums.RoleType;
import com.landuse.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        userRepository.findByUsername("admin").ifPresentOrElse(u -> {}, () ->
                userRepository.save(User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin123"))
                        .email("admin@example.com")
                        .nationalId("0000000000")
                        .role(RoleType.ROLE_ADMIN)
                        .build())
        );
        userRepository.findByUsername("user1").ifPresentOrElse(u -> {}, () ->
                userRepository.save(User.builder()
                        .username("user1")
                        .password(passwordEncoder.encode("user12345"))
                        .email("user1@example.com")
                        .nationalId("1111111111")
                        .role(RoleType.ROLE_USER)
                        .build())
        );
    }
}