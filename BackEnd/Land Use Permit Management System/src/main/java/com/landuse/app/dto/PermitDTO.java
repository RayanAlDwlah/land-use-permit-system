package com.landuse.app.dto;

import com.landuse.app.enums.PermitStatus;
import com.landuse.app.enums.PermitType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PermitDTO {
    private Long id;

    // Main
    private PermitType type;
    private String applicantName;
    private String nationalIdOrCr;
    private String purpose;
    private Double requestedAreaSqm;
    private String locationDetails;
    private LocalDate startDate;
    private LocalDate endDate;

    // Contact
    private String contactNumber;
    private String email;

    // Workflow
    private PermitStatus status;
    private String adminComment;

    // Audit (أضِفهم لو تبي)
    private Instant createdAt;
    private Instant updatedAt;

    // Files
    private List<AttachmentSummaryDTO> attachments;
}