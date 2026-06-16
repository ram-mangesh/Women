package com.aegis.repository;

import com.aegis.entity.JourneyEventAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface JourneyEventAuditRepository extends JpaRepository<JourneyEventAudit, UUID> {
}
