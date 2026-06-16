package com.recoverai.controller;

import com.recoverai.request.GoogleFitSyncRequest;
import com.recoverai.request.VitalReadingRequest;
import com.recoverai.response.ApiResponse;
import com.recoverai.entity.VitalReading;
import com.recoverai.security.UserPrincipal;
import com.recoverai.service.VitalReadingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/patient/vitals")
@Tag(name = "Vital Readings", description = "Wearable vitals integration and monitoring")
public class VitalReadingController {
    
    @Autowired
    private VitalReadingService vitalService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('PATIENT', 'CAREGIVER')")
    @Operation(summary = "Record vital signs", description = "Record vital readings from wearable or manual entry")
    public ResponseEntity<ApiResponse<VitalReading>> recordVitals(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(required = false) Long patientId,
            @Valid @RequestBody VitalReadingRequest request) {
        
        Long targetPatientId = patientId != null ? patientId : currentUser.getId();
        VitalReading vital = vitalService.recordVitals(targetPatientId, request);
        return ResponseEntity.ok(ApiResponse.success("Vital signs recorded successfully", vital));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'CAREGIVER')")
    @Operation(summary = "Get all vitals", description = "Retrieve all vital readings for a patient")
    public ResponseEntity<ApiResponse<List<VitalReading>>> getAllVitals(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(required = false) Long patientId) {
        
        Long targetPatientId = patientId != null ? patientId : currentUser.getId();
        List<VitalReading> vitals = vitalService.getPatientVitals(targetPatientId);
        return ResponseEntity.ok(ApiResponse.success(vitals));
    }
    
    @GetMapping("/recent")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'CAREGIVER')")
    @Operation(summary = "Get recent vitals", description = "Retrieve vital readings since specified date/time")
    public ResponseEntity<ApiResponse<List<VitalReading>>> getRecentVitals(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(required = false) Long patientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since) {
        
        Long targetPatientId = patientId != null ? patientId : currentUser.getId();
        List<VitalReading> vitals = vitalService.getRecentVitals(targetPatientId, since);
        return ResponseEntity.ok(ApiResponse.success(vitals));
    }
    
    @GetMapping("/range")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'CAREGIVER')")
    @Operation(summary = "Get vitals in range", description = "Retrieve vitals within date/time range")
    public ResponseEntity<ApiResponse<List<VitalReading>>> getVitalsInRange(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(required = false) Long patientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        
        Long targetPatientId = patientId != null ? patientId : currentUser.getId();
        List<VitalReading> vitals = vitalService.getVitalsInRange(targetPatientId, start, end);
        return ResponseEntity.ok(ApiResponse.success(vitals));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'CAREGIVER')")
    @Operation(summary = "Get vital by ID", description = "Retrieve specific vital reading")
    public ResponseEntity<ApiResponse<VitalReading>> getVitalById(@PathVariable Long id) {
        VitalReading vital = vitalService.getVitalById(id);
        return ResponseEntity.ok(ApiResponse.success(vital));
    }
    
    @PostMapping("/sync-google-fit")
    @PreAuthorize("hasAnyRole('PATIENT', 'CAREGIVER')")
    @Operation(summary = "Sync Google Fit data", description = "Bulk sync vitals from Google Fit / smartwatch")
    public ResponseEntity<ApiResponse<List<VitalReading>>> syncGoogleFit(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody GoogleFitSyncRequest request) {
        
        List<VitalReading> synced = vitalService.syncGoogleFitData(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Google Fit data synced: " + synced.size() + " readings", synced));
    }
}
