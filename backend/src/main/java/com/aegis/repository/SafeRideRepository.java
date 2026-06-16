package com.aegis.repository;

import com.aegis.entity.SafeRideSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SafeRideRepository extends JpaRepository<SafeRideSession, UUID> {
    List<SafeRideSession> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<SafeRideSession> findByStatus(SafeRideSession.RideStatus status);
    Optional<SafeRideSession> findTopByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, SafeRideSession.RideStatus status);
}
