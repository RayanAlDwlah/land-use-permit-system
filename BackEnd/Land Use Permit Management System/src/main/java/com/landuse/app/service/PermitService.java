package com.landuse.app.service;

import com.landuse.app.dto.*;
import com.landuse.app.entity.Permit;
import com.landuse.app.entity.User;
import com.landuse.app.enums.PermitStatus;
import com.landuse.app.exception.ResourceNotFoundException;
import com.landuse.app.repository.PermitRepository;
import com.landuse.app.repository.UserRepository;
import com.landuse.app.util.PermitMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service @RequiredArgsConstructor
public class PermitService {

    private final PermitRepository permitRepository;
    private final UserRepository userRepository;

    @Transactional
    public PermitDTO create(String username, PermitRequestDTO dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (dto.getRequestedAreaSqm() < 1) throw new IllegalArgumentException("requestedAreaSqm must be >= 1");
        if (dto.getEndDate().isBefore(dto.getStartDate())) throw new IllegalArgumentException("endDate must be >= startDate");

        Permit p = Permit.builder()
                .user(user)
                .applicantName(dto.getApplicantName())
                .nationalIdOrCr(dto.getNationalIdOrCr())
                .type(dto.getType())
                .purpose(dto.getPurpose())
                .requestedAreaSqm(dto.getRequestedAreaSqm())
                .locationDetails(dto.getLocationDetails())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .contactNumber(dto.getContactNumber())
                .email(dto.getEmail())
                .status(PermitStatus.PENDING)
                .build();

        p = permitRepository.save(p);
        p.getAttachments().size();
        return PermitMapper.toDTO(p);
    }

    @Transactional
    public List<PermitDTO> myPermits(String username) {
        List<Permit> list = permitRepository.findByUser_Username(username);
        list.forEach(pp -> pp.getAttachments().size());
        return list.stream().map(PermitMapper::toDTO).toList();
    }

    @Transactional
    public PermitDTO getMine(String username, Long id) {
        Permit p = permitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permit not found: " + id));
        if (!p.getUser().getUsername().equals(username))
            throw new IllegalArgumentException("You do not own this permit");
        p.getAttachments().size();
        return PermitMapper.toDTO(p);
    }

    @Transactional
    public PermitDTO updateMine(String username, Long id, PermitUpdateDTO dto) {
        Permit p = permitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permit not found: " + id));
        if (!p.getUser().getUsername().equals(username))
            throw new IllegalArgumentException("You do not own this permit");

        if (p.getStatus() != PermitStatus.EDIT_REQUESTED)
            throw new IllegalStateException("Permit is not editable in current state: " + p.getStatus());

        if (dto.getRequestedAreaSqm() != null && dto.getRequestedAreaSqm() < 1)
            throw new IllegalArgumentException("requestedAreaSqm must be >= 1");
        if (dto.getStartDate() != null && dto.getEndDate() != null && dto.getEndDate().isBefore(dto.getStartDate()))
            throw new IllegalArgumentException("endDate must be >= startDate");

        if (StringUtils.hasText(dto.getApplicantName()))   p.setApplicantName(dto.getApplicantName());
        if (StringUtils.hasText(dto.getNationalIdOrCr()))  p.setNationalIdOrCr(dto.getNationalIdOrCr());
        if (dto.getType() != null)                         p.setType(dto.getType());
        if (StringUtils.hasText(dto.getPurpose()))         p.setPurpose(dto.getPurpose());
        if (dto.getRequestedAreaSqm() != null)             p.setRequestedAreaSqm(dto.getRequestedAreaSqm());
        if (StringUtils.hasText(dto.getLocationDetails())) p.setLocationDetails(dto.getLocationDetails());
        if (dto.getStartDate() != null)                    p.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null)                      p.setEndDate(dto.getEndDate());
        if (StringUtils.hasText(dto.getContactNumber()))   p.setContactNumber(dto.getContactNumber());
        if (StringUtils.hasText(dto.getEmail()))           p.setEmail(dto.getEmail());

        p.setStatus(PermitStatus.PENDING);
        p.getAttachments().size();
        return PermitMapper.toDTO(p);
    }

    @Transactional
    public PermitDTO adminApprove(Long id, String comment) {
        Permit p = permitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permit not found: " + id));
        p.setStatus(PermitStatus.APPROVED);
        if (StringUtils.hasText(comment)) p.setAdminComment(comment);
        p.getAttachments().size();
        return PermitMapper.toDTO(p);
    }

    @Transactional
    public PermitDTO adminReject(Long id, String comment) {
        if (!StringUtils.hasText(comment)) throw new IllegalArgumentException("comment is required for REJECT");
        Permit p = permitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permit not found: " + id));
        p.setStatus(PermitStatus.REJECTED);
        p.setAdminComment(comment);
        p.getAttachments().size();
        return PermitMapper.toDTO(p);
    }

    @Transactional
    public PermitDTO adminRequestEdit(Long id, String comment) {
        if (!StringUtils.hasText(comment)) throw new IllegalArgumentException("comment is required for EDIT_REQUESTED");
        Permit p = permitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permit not found: " + id));
        p.setStatus(PermitStatus.EDIT_REQUESTED);
        p.setAdminComment(comment);
        p.getAttachments().size();
        return PermitMapper.toDTO(p);
    }

    @Transactional
    public List<PermitDTO> adminList(com.landuse.app.enums.PermitStatus status) {
        List<Permit> data = (status == null) ? permitRepository.findAll() : permitRepository.findByStatus(status);
        data.forEach(pp -> pp.getAttachments().size());
        return data.stream().map(PermitMapper::toDTO).toList();
    }

    @Transactional
    public PermitDTO adminGetPermit(Long id) {
        Permit p = permitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permit not found: " + id));
        p.getAttachments().size();
        return PermitMapper.toDTO(p);
    }

    @Transactional
    public AdminReportSummaryDTO summary() {
        long total = permitRepository.count();
        long pnd = permitRepository.countByStatus(com.landuse.app.enums.PermitStatus.PENDING);
        long apr = permitRepository.countByStatus(com.landuse.app.enums.PermitStatus.APPROVED);
        long rej = permitRepository.countByStatus(com.landuse.app.enums.PermitStatus.REJECTED);
        long edt = permitRepository.countByStatus(com.landuse.app.enums.PermitStatus.EDIT_REQUESTED);
        return new AdminReportSummaryDTO(total, pnd, apr, rej, edt);
    }
}