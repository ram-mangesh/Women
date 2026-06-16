package com.aegis.repository;

import com.aegis.entity.GuardianConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GuardianConnectionRepository extends JpaRepository<GuardianConnection, UUID> {
    List<GuardianConnection> findByWardIdAndStatus(UUID wardId, GuardianConnection.Status status);
    List<GuardianConnection> findByGuardianIdAndStatus(UUID guardianId, GuardianConnection.Status status);
    Optional<GuardianConnection> findByGuardianIdAndWardId(UUID guardianId, UUID wardId);
}
