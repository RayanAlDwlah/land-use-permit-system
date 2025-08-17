package com.landuse.app.controller;

import com.landuse.app.dto.AdminReportSummaryDTO;
import com.landuse.app.dto.PermitDTO;
import com.landuse.app.enums.PermitStatus;
import com.landuse.app.service.PermitService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController @RequestMapping("/api/admin") @RequiredArgsConstructor @PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final PermitService permitService;

    @GetMapping("/permits")
    public List<PermitDTO> list(@RequestParam(required = false) PermitStatus status) {
        return permitService.adminList(status);
    }

    @GetMapping("/permits/{id}")
    public PermitDTO getOne(@PathVariable Long id) {
        return permitService.adminGetPermit(id);
    }

    @PutMapping("/permits/{id}/approve")
    public PermitDTO approve(@PathVariable Long id, @RequestBody(required = false) CommentBody body) {
        return permitService.adminApprove(id, body == null ? null : body.comment());
    }

    @PutMapping("/permits/{id}/reject")
    public PermitDTO reject(@PathVariable Long id, @RequestBody CommentBody body) {
        if (body == null || body.comment() == null || body.comment().isBlank())
            throw new IllegalArgumentException("comment is required for reject");
        return permitService.adminReject(id, body.comment());
    }

    @PutMapping("/permits/{id}/request-edit")
    public PermitDTO requestEdit(@PathVariable Long id, @RequestBody CommentBody body) {
        if (body == null || body.comment() == null || body.comment().isBlank())
            throw new IllegalArgumentException("comment is required for request-edit");
        return permitService.adminRequestEdit(id, body.comment());
    }

    @GetMapping("/reports/summary")
    public AdminReportSummaryDTO summary() {
        return permitService.summary(); }

    public record CommentBody(@NotBlank String comment) {}
}