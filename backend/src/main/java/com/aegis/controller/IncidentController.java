package com.aegis.controller;

import com.aegis.dto.request.IncidentReportRequest;
import com.aegis.dto.response.IncidentReportResponse;
import com.aegis.entity.User;
import com.aegis.repository.UserRepository;
import com.aegis.service.IncidentReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/incidents")
@RequiredArgsConstructor
@Tag(name = "Incidents", description = "Community safety reports")
public class IncidentController {

    private final IncidentReportService svc;
    private final UserRepository users;

    @PostMapping
    @Operation(summary = "File a new community incident report")
    public ResponseEntity<IncidentReportResponse> create(
        @AuthenticationPrincipal UserDetails principal,
        @Valid @RequestBody IncidentReportRequest r
    ) {
        UUID uid = users.findByEmail(principal.getUsername()).orElseThrow().getId();
        return ResponseEntity.status(HttpStatus.CREATED).body(svc.create(uid, r));
    }

    @GetMapping
    @Operation(summary = "List all reports (paginated, public)")
    public ResponseEntity<Page<IncidentReportResponse>> list(@PageableDefault(size = 25) Pageable p) {
        return ResponseEntity.ok(svc.list(p));
    }

    @GetMapping("/verified")
    public ResponseEntity<List<IncidentReportResponse>> verified() {
        return ResponseEntity.ok(svc.verified());
    }

    @GetMapping("/bbox")
    @Operation(summary = "Reports inside a geographic bounding box")
    public ResponseEntity<List<IncidentReportResponse>> bbox(
        @RequestParam double minLat, @RequestParam double maxLat,
        @RequestParam double minLng, @RequestParam double maxLng
    ) {
        return ResponseEntity.ok(svc.boundingBox(minLat, maxLat, minLng, maxLng));
    }

    @PostMapping("/{id}/upvote")
    public ResponseEntity<Void> upvote(@PathVariable UUID id) {
        svc.upvote(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Verify an incident report (admin only)")
    public ResponseEntity<IncidentReportResponse> verify(
        @PathVariable UUID id,
        @AuthenticationPrincipal UserDetails principal
    ) {
        UUID adminId = users.findByEmail(principal.getUsername()).orElseThrow().getId();
        return ResponseEntity.ok(svc.verify(id, adminId));
    }
}
