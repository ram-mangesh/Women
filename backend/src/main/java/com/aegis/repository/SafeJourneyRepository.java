package com.aegis.repository;

import com.aegis.entity.SafeJourneySession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SafeJourneyRepository extends JpaRepository<SafeJourneySession, UUID> {
    
    Optional<SafeJourneySession> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByIdAndUserId(UUID id, UUID userId);
    
    List<SafeJourneySession> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    Page<SafeJourneySession> findByStatusIn(List<SafeJourneySession.JourneyStatus> statuses, Pageable pageable);
    
    Page<SafeJourneySession> findByExpectedArrivalTimeBeforeAndStatusNotIn(Instant time, List<SafeJourneySession.JourneyStatus> statuses, Pageable pageable);

    List<SafeJourneySession> findByStatusInAndIdGreaterThanOrderByIdAsc(List<SafeJourneySession.JourneyStatus> statuses, UUID id, Pageable pageable);
    
    List<SafeJourneySession> findByExpectedArrivalTimeBeforeAndStatusNotInAndIdGreaterThanOrderByIdAsc(Instant time, List<SafeJourneySession.JourneyStatus> statuses, UUID id, Pageable pageable);

    /**
     * Direct SQL UPDATE that bypasses Hibernate @Version optimistic locking.
     * Used by confirmArrival to avoid ObjectOptimisticLockingFailureException
     * when the scheduler concurrently modifies the same session row.
     */
    @Modifying
    @Query("UPDATE SafeJourneySession s SET s.status = :status, s.completedAt = :completedAt WHERE s.id = :id AND s.user.id = :userId")
    int setCompletedDirect(
        @Param("id") UUID id,
        @Param("userId") UUID userId,
        @Param("status") SafeJourneySession.JourneyStatus status,
        @Param("completedAt") Instant completedAt
    );
}
