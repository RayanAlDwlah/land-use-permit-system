package com.landuse.app.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.landuse.app.enums.AttachmentType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "attachments",
        indexes = @Index(name = "idx_attachment_permit", columnList = "permit_id"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Attachment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, length = 255)  private String fileName;
    @Column(nullable = false, length = 100)  private String fileType;
    @Column(nullable = false)               private Long sizeBytes;
    @Column(nullable = false, length = 1024) private String storagePath;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 40)
    private AttachmentType attachmentType = AttachmentType.OTHER;

    @Column(nullable = false, length = 64) private String uploadedBy;
    @Column(nullable = false)               private Instant uploadedAt;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "permit_id", nullable = false)
    @JsonIgnore
    private Permit permit;
}