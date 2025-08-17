package com.landuse.app.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
public class UserController {

    @GetMapping("/dashboard")
    public String dashboard() {
        return "User Dashboard";
    }
}