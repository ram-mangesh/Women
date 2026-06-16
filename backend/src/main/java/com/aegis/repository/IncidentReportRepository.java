package com.aegis.repository;

import com.aegis.entity.IncidentReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IncidentReportRepository extends JpaRepository<IncidentReport, UUID> {

    Page<IncidentReport> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<IncidentReport> findByVerifiedTrueOrderByCreatedAtDesc();

    List<IncidentReport> findByTypeOrderByCreatedAtDesc(IncidentReport.Type type);

    @Query("SELECT r FROM IncidentReport r " +
           "WHERE r.latitude BETWEEN :minLat AND :maxLat " +
           "  AND r.longitude BETWEEN :minLng AND :maxLng " +
           "ORDER BY r.createdAt DESC")
    List<IncidentReport> findInBoundingBox(
        @Param("minLat") double minLat, @Param("maxLat") double maxLat,
        @Param("minLng") double minLng, @Param("maxLng") double maxLng);

    @Modifying
    @Query("UPDATE IncidentReport r SET r.upvotes = r.upvotes + 1 WHERE r.id = :id")
    int incrementUpvotes(@Param("id") UUID id);
}
