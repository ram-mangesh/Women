package com.aegis.repository;

import com.aegis.entity.GuardianAcknowledgement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GuardianAcknowledgementRepository extends JpaRepository<GuardianAcknowledgement, UUID> {
}
