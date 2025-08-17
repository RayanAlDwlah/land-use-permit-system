package com.landuse.app.entity;

import com.landuse.app.enums.RoleType;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_users_username", columnNames = "username"),
                @UniqueConstraint(name = "uk_users_email", columnNames = "email"),
                @UniqueConstraint(name = "uk_users_national_id", columnNames = "national_id")
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @EqualsAndHashCode(of = "id")
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Column(nullable = false, length = 64)
    private String username;

    @NotBlank @Email @Column(nullable = false, length = 120)
    private String email;

    @NotBlank @Column(nullable = false, length = 100)
    private String password;

    @NotBlank @Column(name = "national_id", nullable = false, length = 32)
    private String nationalId;

    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private RoleType role; // ROLE_USER / ROLE_ADMIN

    @Column(nullable = false) private Instant createdAt;
    @Column(nullable = false) private Instant updatedAt;

    @PrePersist void onCreate() { Instant now = Instant.now(); createdAt = now; updatedAt = now; }
    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }
}