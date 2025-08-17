package com.landuse.app.repository;

import com.landuse.app.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByPermit_Id(Long permitId);
    List<Attachment> findByPermit_IdAndPermit_User_Username(Long permitId, String username);
}