package com.landuse.app.repository;

import com.landuse.app.entity.Permit;
import com.landuse.app.enums.PermitStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PermitRepository extends JpaRepository<Permit, Long> {
    List<Permit> findByUser_Username(String username);
    List<Permit> findByStatus(PermitStatus status);
    long countByStatus(PermitStatus status);
}