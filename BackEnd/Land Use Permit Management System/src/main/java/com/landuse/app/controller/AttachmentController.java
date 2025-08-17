package com.landuse.app.controller;

import com.landuse.app.dto.AttachmentSummaryDTO;
import com.landuse.app.entity.Attachment;
import com.landuse.app.enums.AttachmentType;
import com.landuse.app.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;

@RestController @RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    private static AttachmentSummaryDTO toDto(Attachment a) {
        return new AttachmentSummaryDTO(
                a.getId(), a.getFileName(), a.getFileType(), a.getSizeBytes(),
                "/api/attachments/" + a.getId() + "/download", a.getUploadedBy(), a.getUploadedAt()
        );
    }
    private static boolean isAdmin(User me) {
        if (me == null) return false;
        for (GrantedAuthority ga : me.getAuthorities()) if ("ROLE_ADMIN".equals(ga.getAuthority())) return true;
        return false;
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping(value = "/api/user/permits/{permitId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadMine(@PathVariable Long permitId,
                                           @RequestParam("files") MultipartFile[] files,
                                           @RequestParam(name = "attachmentType", required = false) AttachmentType type,
                                           @AuthenticationPrincipal User me) {
        attachmentService.upload(me.getUsername(), permitId, files, type);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/api/admin/permits/{permitId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadAdmin(@PathVariable Long permitId,
                                            @RequestParam("files") MultipartFile[] files,
                                            @RequestParam(name = "attachmentType", required = false) AttachmentType type,
                                            @AuthenticationPrincipal User me) {
        attachmentService.uploadAll(permitId, files, me.getUsername(), true, type);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/api/user/permits/{permitId}/attachments")
    public List<AttachmentSummaryDTO> listMine(@PathVariable Long permitId, @AuthenticationPrincipal User me) {
        return attachmentService.listForPermit(permitId, me.getUsername(), false).stream().map(AttachmentController::toDto).toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/admin/permits/{permitId}/attachments")
    public List<AttachmentSummaryDTO> listAdmin(@PathVariable Long permitId, @AuthenticationPrincipal User me) {
        return attachmentService.listForPermit(permitId, me.getUsername(), true).stream().map(AttachmentController::toDto).toList();
    }

    @GetMapping("/api/attachments/{attachmentId}/download")
    public ResponseEntity<FileSystemResource> download(@PathVariable Long attachmentId, @AuthenticationPrincipal User me) {
        boolean admin = isAdmin(me);
        String username = (me == null ? null : me.getUsername());
        var a = attachmentService.getForDownload(attachmentId, username, admin);

        File file = new File(a.getStoragePath());
        if (!file.exists()) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        FileSystemResource resource = new FileSystemResource(file);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(a.getFileType()));
        headers.setContentDisposition(ContentDisposition.attachment().filename(a.getFileName()).build());
        return new ResponseEntity<>(resource, headers, HttpStatus.OK);
    }

    @PreAuthorize("hasRole('USER')")
    @DeleteMapping("/api/user/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteMine(@PathVariable Long attachmentId, @AuthenticationPrincipal User me) {
        attachmentService.deleteAttachment(attachmentId, me.getUsername(), false);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/admin/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Long attachmentId, @AuthenticationPrincipal User me) {
        attachmentService.deleteAttachment(attachmentId, me.getUsername(), true);
        return ResponseEntity.noContent().build();
    }
}