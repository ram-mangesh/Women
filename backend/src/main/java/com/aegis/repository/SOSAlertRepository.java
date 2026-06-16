package com.aegis.repository;

import com.aegis.entity.SOSAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface SOSAlertRepository extends JpaRepository<SOSAlert, UUID> {

    Page<SOSAlert> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    List<SOSAlert> findByStatusOrderByCreatedAtDesc(SOSAlert.Status status);

    List<SOSAlert> findByStatusInOrderByCreatedAtDesc(List<SOSAlert.Status> statuses);

    @Query("SELECT s FROM SOSAlert s WHERE s.status IN :statuses ORDER BY s.createdAt DESC")
    List<SOSAlert> findActive(@Param("statuses") List<SOSAlert.Status> statuses);

    long countByStatus(SOSAlert.Status status);

    long countByCreatedAtAfter(Instant after);

    @Query("SELECT COUNT(s) FROM SOSAlert s WHERE s.status = 'RESOLVED' AND s.createdAt >= :from")
    long countResolvedSince(@Param("from") Instant from);
}
