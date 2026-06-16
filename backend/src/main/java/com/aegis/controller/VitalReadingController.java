package com.aegis.controller;

import com.aegis.dto.request.GoogleFitSyncRequest;
import com.aegis.dto.request.VitalReadingRequest;
import com.aegis.entity.VitalReading;
import com.aegis.repository.UserRepository;
import com.aegis.service.VitalReadingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v1/patient/vitals")
@RequiredArgsConstructor
@Tag(name = "Patient Vitals", description = "Smartwatch health data and manual vitals recording")
public class VitalReadingController {

    private final VitalReadingService vitalService;
    private final UserRepository users;

    /** Resolve UUID from the JWT principal */
    private UUID uid(UserDetails principal) {
        return users.findByEmail(principal.getUsername()).orElseThrow().getId();
    }

    @PostMapping
    @Operation(summary = "Record a single manual vital reading")
    public ResponseEntity<Map<String, Object>> record(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody VitalReadingRequest request) {
        UUID patientId = uid(principal);
        VitalReading saved = vitalService.recordVitals(patientId, request);
        return ResponseEntity.ok(Map.of("data", saved, "message", "Vital recorded & AI analysis complete"));
    }

    @PostMapping("/sync-google-fit")
    @Operation(summary = "Bulk-sync Google Fit / wearable data")
    public ResponseEntity<Map<String, Object>> syncGoogleFit(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody GoogleFitSyncRequest request) {
        UUID patientId = uid(principal);
        List<VitalReading> synced = vitalService.syncGoogleFitData(patientId, request);
        return ResponseEntity.ok(Map.of(
                "data", synced,
                "message", synced.size() + " reading(s) synced from Google Fit"
        ));
    }

    @GetMapping
    @Operation(summary = "Get all vitals for the authenticated patient")
    public ResponseEntity<Map<String, Object>> getMyVitals(
            @AuthenticationPrincipal UserDetails principal) {
        UUID patientId = uid(principal);
        List<VitalReading> vitals = vitalService.getPatientVitals(patientId);
        return ResponseEntity.ok(Map.of("data", vitals));
    }

    @GetMapping("/abnormal")
    @Operation(summary = "Get all abnormal vital readings (admin/guardian view)")
    public ResponseEntity<Map<String, Object>> getAbnormal() {
        return ResponseEntity.ok(Map.of("data", vitalService.getAllAbnormalVitals()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific vital reading by ID")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("data", vitalService.getVitalById(id)));
    }
}
