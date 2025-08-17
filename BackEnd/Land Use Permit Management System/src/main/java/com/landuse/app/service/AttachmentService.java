package com.landuse.app.service;

import com.landuse.app.entity.Attachment;
import com.landuse.app.entity.Permit;
import com.landuse.app.enums.AttachmentType;
import com.landuse.app.enums.PermitStatus;
import com.landuse.app.exception.ResourceNotFoundException;
import com.landuse.app.repository.AttachmentRepository;
import com.landuse.app.repository.PermitRepository;
import com.landuse.app.util.AppConstants;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.Instant;
import java.util.*;

@Service @RequiredArgsConstructor @Slf4j
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final PermitRepository permitRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Transactional
    public List<Attachment> upload(String username, Long permitId, MultipartFile[] files, AttachmentType type) {
        return uploadAllInternal(permitId, files, username, false, type);
    }

    @Transactional
    public List<Attachment> uploadAll(Long permitId, MultipartFile[] files, String username, boolean isAdmin, AttachmentType type) {
        return uploadAllInternal(permitId, files, username, isAdmin, type);
    }

    @Transactional
    public List<Attachment> listForPermit(Long permitId, String requesterUsername, boolean isAdmin) {
        Permit p = getPermit(permitId);
        if (!isAdmin && !p.getUser().getUsername().equals(requesterUsername))
            throw new IllegalArgumentException("You do not own this permit");
        p.getAttachments().size();
        return p.getAttachments();
    }

    @Transactional
    public Attachment getForDownload(Long attachmentId, String requesterUsername, boolean isAdmin) {
        Attachment a = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found: " + attachmentId));
        if (!isAdmin && (requesterUsername == null ||
                !a.getPermit().getUser().getUsername().equals(requesterUsername))) {
            throw new IllegalArgumentException("You do not own this permit");
        }
        return a;
    }

    @Transactional
    public void deleteAttachment(Long attachmentId, String requesterUsername, boolean isAdmin) {
        Attachment a = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found: " + attachmentId));
        Permit p = a.getPermit();

        if (p.getStatus() == PermitStatus.APPROVED || p.getStatus() == PermitStatus.REJECTED)
            throw new IllegalStateException("Attachments cannot be modified after permit is " + p.getStatus());

        if (!isAdmin && !p.getUser().getUsername().equals(requesterUsername))
            throw new IllegalArgumentException("You do not own this permit");

        try { Files.deleteIfExists(Path.of(a.getStoragePath())); }
        catch (IOException e) { log.warn("Failed to delete file {}", a.getStoragePath(), e); }

        attachmentRepository.delete(a);
    }

    // ===== helpers =====
    private List<Attachment> uploadAllInternal(Long permitId, MultipartFile[] files, String username, boolean isAdmin, AttachmentType type) {
        List<Attachment> out = new ArrayList<>();
        if (files == null || files.length == 0) return out;
        for (MultipartFile f : files) {
            if (f != null && !f.isEmpty()) out.add(uploadInternal(permitId, f, username, isAdmin, type));
        }
        return out;
    }

    private Attachment uploadInternal(Long permitId, MultipartFile mf, String username, boolean isAdmin, AttachmentType type) {
        Permit p = getPermit(permitId);

        if (p.getStatus() == PermitStatus.APPROVED || p.getStatus() == PermitStatus.REJECTED)
            throw new IllegalStateException("Attachments cannot be modified after permit is " + p.getStatus());

        if (!isAdmin && !p.getUser().getUsername().equals(username))
            throw new IllegalArgumentException("You do not own this permit");

        validateFileType(mf);

        String safeName = filenameSafe(mf);
        String uuid = UUID.randomUUID().toString();
        Path dir = Path.of(uploadDir, String.valueOf(p.getId()));
        try {
            Files.createDirectories(dir);
            Path target = dir.resolve(uuid + "_" + safeName);

            try (var in = mf.getInputStream()) {
                Files.copy(in, target, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            }
            Attachment a = new Attachment();
            a.setPermit(p);
            a.setFileName(safeName);
            a.setFileType(mf.getContentType());
            a.setSizeBytes(mf.getSize());
            a.setStoragePath(target.toString());
            a.setUploadedAt(Instant.now());
            a.setUploadedBy(username);
            a.setAttachmentType(type == null ? AttachmentType.OTHER : type);

            return attachmentRepository.save(a);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + safeName, e);
        }
    }

    private Permit getPermit(Long id) {
        return permitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permit not found: " + id));
    }

    private String filenameSafe(MultipartFile mf) {
        String original = mf.getOriginalFilename() == null ? "file" : mf.getOriginalFilename();
        String cleaned = StringUtils.cleanPath(original).replaceAll("[\\r\\n]", "");
        if (cleaned.length() > com.landuse.app.util.AppConstants.MAX_FILENAME_LEN)
            cleaned = cleaned.substring(cleaned.length() - com.landuse.app.util.AppConstants.MAX_FILENAME_LEN);
        return cleaned;
    }

    private void validateFileType(MultipartFile mf) {
        String ct = mf.getContentType() == null ? "" : mf.getContentType().toLowerCase();
        String name = mf.getOriginalFilename() == null ? "" : mf.getOriginalFilename().toLowerCase();

        boolean typeAllowed = com.landuse.app.util.AppConstants.ALLOWED_CONTENT_TYPES.contains(ct);
        boolean extAllowed = name.endsWith(".pdf") || name.endsWith(".jpeg") || name.endsWith(".jpg") || name.endsWith(".png");

        if (!(typeAllowed && extAllowed)) throw new IllegalArgumentException("Only PDF/JPEG/PNG are allowed");
    }
}