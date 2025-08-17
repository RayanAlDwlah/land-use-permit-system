package com.landuse.app.entity;

import com.landuse.app.enums.PermitStatus;
import com.landuse.app.enums.PermitType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "permits",
        indexes = {
                @Index(name = "idx_permit_status", columnList = "status"),
                @Index(name = "idx_permit_user", columnList = "user_id"),
                @Index(name = "idx_permit_created_at", columnList = "createdAt")
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Permit {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 150) private String applicantName;
    @Column(nullable = false, length = 30)  private String nationalIdOrCr;

    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 40)
    private PermitType type;

    @Column(nullable = false, length = 2000) private String purpose;
    @Column(nullable = false) private Double requestedAreaSqm;
    @Column(nullable = false, length = 500) private String locationDetails;
    @Column(nullable = false) private LocalDate startDate;
    @Column(nullable = false) private LocalDate endDate;

    @Column(nullable = false, length = 30)  private String contactNumber;
    @Column(nullable = false, length = 254) private String email;

    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 32)
    private PermitStatus status;

    @Column(length = 1000) private String adminComment;

    @OneToMany(mappedBy = "permit", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default private List<Attachment> attachments = new ArrayList<>();

    @Column(nullable = false, updatable = false) private Instant createdAt;
    @Column(nullable = false) private Instant updatedAt;

    @PrePersist void onCreate() {
        Instant now = Instant.now();
        createdAt = now; updatedAt = now;
        if (status == null) status = PermitStatus.PENDING;
    }
    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }
}