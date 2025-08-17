package com.landuse.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttachmentSummaryDTO {
    private Long id;
    private String fileName;      // الاسم الأصلي
    private String fileType;      // MIME type
    private Long fileSize;        // بايت
    private String downloadUrl;   // /api/attachments/{id}/download
    private String uploadedBy;    // username
    private Instant uploadedAt;   // وقت الرفع
}