package com.landuse.app.repository;

import com.landuse.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByNationalId(String nationalId);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}