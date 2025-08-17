package com.landuse.app.util;

import com.landuse.app.dto.AttachmentSummaryDTO;
import com.landuse.app.dto.PermitDTO;
import com.landuse.app.entity.Attachment;
import com.landuse.app.entity.Permit;

import java.util.List;

public class PermitMapper {
    public static PermitDTO toDTO(Permit p) {
        List<AttachmentSummaryDTO> files = (p.getAttachments() == null) ? List.of()
                : p.getAttachments().stream().map(PermitMapper::toAttachmentSummary).toList();

        PermitDTO dto = new PermitDTO();
        dto.setId(p.getId());
        dto.setType(p.getType());
        dto.setApplicantName(p.getApplicantName());
        dto.setNationalIdOrCr(p.getNationalIdOrCr());
        dto.setPurpose(p.getPurpose());
        dto.setRequestedAreaSqm(p.getRequestedAreaSqm());
        dto.setLocationDetails(p.getLocationDetails());
        dto.setStartDate(p.getStartDate());
        dto.setEndDate(p.getEndDate());
        dto.setContactNumber(p.getContactNumber());
        dto.setEmail(p.getEmail());
        dto.setStatus(p.getStatus());
        dto.setAdminComment(p.getAdminComment());
        dto.setAttachments(files);
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }

    private static AttachmentSummaryDTO toAttachmentSummary(Attachment a) {
        String downloadUrl = "/api/attachments/" + a.getId() + "/download";
        return new AttachmentSummaryDTO(a.getId(), a.getFileName(), a.getFileType(), a.getSizeBytes(),
                downloadUrl, a.getUploadedBy(), a.getUploadedAt());
    }
}