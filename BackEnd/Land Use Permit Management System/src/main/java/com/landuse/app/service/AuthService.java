package com.landuse.app.service;

import com.landuse.app.dto.*;
import com.landuse.app.entity.User;
import com.landuse.app.enums.RoleType;
import com.landuse.app.exception.ResourceNotFoundException;
import com.landuse.app.repository.UserRepository;
import com.landuse.app.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public void register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) throw new IllegalArgumentException("Username is already taken");
        if (userRepository.existsByEmail(req.getEmail()))       throw new IllegalArgumentException("Email is already taken");

        RoleType role = (req.getRole() != null) ? req.getRole() : RoleType.ROLE_USER;

        User u = User.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .email(req.getEmail())
                .nationalId(req.getNationalId())
                .role(role)
                .build();
        userRepository.save(u);
    }

    public JwtResponse login(LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );
        String token = jwtUtil.generateToken(auth);
        return new JwtResponse(token);
    }

    public MeDTO getMe(String username) {
        User u = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new MeDTO(u.getUsername(), u.getEmail(), u.getRole().name());
    }
}