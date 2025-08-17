package com.landuse.app.controller;

import com.landuse.app.dto.*;
import com.landuse.app.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public void register(@Valid @RequestBody RegisterRequest request) { authService.register(request); }

    @PostMapping("/login")
    public JwtResponse login(@Valid @RequestBody LoginRequest request) { return authService.login(request); }

    @GetMapping("/me")
    public MeDTO getMe(@AuthenticationPrincipal User user) {
        if (user == null) throw new RuntimeException("Unauthorized");
        return authService.getMe(user.getUsername());
    }
}