package com.recoverai.repository;

import com.recoverai.entity.VitalReading;
import com.recoverai.entity.VitalReading.ReadingSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VitalReadingRepository extends JpaRepository<VitalReading, Long> {
    
    @Query("SELECT v FROM VitalReading v JOIN FETCH v.patient WHERE v.isAbnormal = true ORDER BY v.recordedAt DESC")
    List<VitalReading> getAllAbnormalVitals();
    
    List<VitalReading> findByPatientId(Long patientId);
    
    List<VitalReading> findByPatientIdAndRecordedAtBetween(
        Long patientId, LocalDateTime start, LocalDateTime end);
    
    List<VitalReading> findByPatientIdAndSource(Long patientId, ReadingSource source);
    
    List<VitalReading> findByPatientIdAndIsAbnormal(Long patientId, Boolean isAbnormal);
    
    List<VitalReading> findByPatientIdAndAlertTriggered(Long patientId, Boolean alertTriggered);
    
    @Query("SELECT v FROM VitalReading v WHERE v.patient.id = :patientId " +
           "ORDER BY v.recordedAt DESC")
    List<VitalReading> findLatestReadings(@Param("patientId") Long patientId);
    
    @Query("SELECT v FROM VitalReading v WHERE v.patient.id = :patientId " +
           "AND v.recordedAt >= :since ORDER BY v.recordedAt DESC")
    List<VitalReading> findRecentReadings(
        @Param("patientId") Long patientId, 
        @Param("since") LocalDateTime since);
    
    @Query("SELECT AVG(v.heartRate) FROM VitalReading v WHERE v.patient.id = :patientId " +
           "AND v.recordedAt BETWEEN :start AND :end AND v.heartRate IS NOT NULL")
    Double getAverageHeartRate(
        @Param("patientId") Long patientId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end);
}
