package com.landuse.app.controller;

import com.landuse.app.dto.PermitDTO;
import com.landuse.app.dto.PermitRequestDTO;
import com.landuse.app.dto.PermitUpdateDTO;
import com.landuse.app.service.PermitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController @RequiredArgsConstructor @RequestMapping("/api/user") @PreAuthorize("hasRole('USER')")
public class PermitController {

    private final PermitService permitService;

    @PostMapping("/permits")
    public ResponseEntity<PermitDTO> createPermit(@AuthenticationPrincipal User me, @Valid @RequestBody PermitRequestDTO dto) {
        return ResponseEntity.ok(permitService.create(me.getUsername(), dto));
    }

    @GetMapping("/permits")
    public ResponseEntity<List<PermitDTO>> listMyPermits(@AuthenticationPrincipal User me) {
        return ResponseEntity.ok(permitService.myPermits(me.getUsername()));
    }

    @GetMapping("/permits/{id}")
    public ResponseEntity<PermitDTO> getMyPermit(@AuthenticationPrincipal User me, @PathVariable Long id) {
        return ResponseEntity.ok(permitService.getMine(me.getUsername(), id));
    }

    @PutMapping("/permits/{id}")
    public ResponseEntity<PermitDTO> updateMyPermit(@AuthenticationPrincipal User me, @PathVariable Long id, @Valid @RequestBody PermitUpdateDTO dto) {
        return ResponseEntity.ok(permitService.updateMine(me.getUsername(), id, dto));
    }
}