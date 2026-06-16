package com.aegis.controller;

import com.aegis.dto.response.SOSAlertResponse;
import com.aegis.repository.SOSAlertRepository;
import com.aegis.repository.ThreatScoreRepository;
import com.aegis.service.SOSService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin-only command-center endpoints")
public class AdminController {

    private final SOSService sos;
    private final SOSAlertRepository alertRepo;
    private final ThreatScoreRepository scoreRepo;

    @GetMapping("/stats")
    @Operation(summary = "Aggregate operational stats")
    public ResponseEntity<Map<String, Object>> stats() {
        Instant dayAgo = Instant.now().minus(1, ChronoUnit.DAYS);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("activeAlerts", alertRepo.countByStatus(com.aegis.entity.SOSAlert.Status.ACTIVE));
        out.put("escalatedAlerts", alertRepo.countByStatus(com.aegis.entity.SOSAlert.Status.ESCALATED));
        out.put("resolvedToday", alertRepo.countResolvedSince(dayAgo));
        out.put("predictionsLastHour", scoreRepo.countByComputedAtAfter(Instant.now().minus(1, ChronoUnit.HOURS)));
        out.put("timestamp", Instant.now());
        return ResponseEntity.ok(out);
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<SOSAlertResponse>> alerts() {
        return ResponseEntity.ok(sos.activeAlerts());
    }
}
