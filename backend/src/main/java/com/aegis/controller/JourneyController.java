package com.aegis.controller;

import com.aegis.dto.request.BulkHeartbeatRequest;
import com.aegis.dto.request.ConfirmArrivalRequest;
import com.aegis.dto.request.JourneyHeartbeatRequest;
import com.aegis.dto.request.StartJourneyRequest;
import com.aegis.dto.response.JourneyResponse;
import com.aegis.repository.UserRepository;
import com.aegis.service.SafeJourneyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v1/journey")
@RequiredArgsConstructor
public class JourneyController {

    private final SafeJourneyService safeJourneyService;
    private final UserRepository userRepository;

    @PostMapping("/start")
    public ResponseEntity<JourneyResponse> startJourney(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody StartJourneyRequest request) {
        UUID userId = userRepository.findByEmail(principal.getUsername()).orElseThrow().getId();
        JourneyResponse response = safeJourneyService.startJourney(userId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/heartbeat")
    public ResponseEntity<Void> receiveHeartbeat(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID id,
            @Valid @RequestBody JourneyHeartbeatRequest request) {
        UUID userId = userRepository.findByEmail(principal.getUsername()).orElseThrow().getId();
        safeJourneyService.receiveHeartbeat(userId, id, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/heartbeat/bulk")
    public ResponseEntity<Map<String, Object>> syncBulkHeartbeats(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID id,
            @Valid @RequestBody BulkHeartbeatRequest request) {
        UUID userId = userRepository.findByEmail(principal.getUsername()).orElseThrow().getId();
        int accepted = safeJourneyService.syncBulkHeartbeats(userId, id, request);
        return ResponseEntity.ok(Map.of(
                "accepted", accepted,
                "total", request.getPoints().size()
        ));
    }

    @PostMapping("/{id}/confirm-arrival")
    public ResponseEntity<Void> confirmArrival(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID id,
            @RequestBody(required = false) ConfirmArrivalRequest request) {
        UUID userId = userRepository.findByEmail(principal.getUsername()).orElseThrow().getId();
        safeJourneyService.confirmArrival(userId, id, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelJourney(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID id) {
        UUID userId = userRepository.findByEmail(principal.getUsername()).orElseThrow().getId();
        safeJourneyService.cancelJourney(userId, id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<JourneyResponse> getJourney(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @PathVariable("id") UUID journeyId) {
        
        UUID userId = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
        JourneyResponse response = safeJourneyService.getJourney(userId, journeyId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/escalation/{id}/ack")
    public ResponseEntity<Void> acknowledgeEscalation(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @PathVariable("id") UUID escalationId,
            @Valid @RequestBody com.aegis.dto.request.GuardianAckRequest request) {
        
        UUID authenticatedUserId = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
        safeJourneyService.acknowledgeEscalation(authenticatedUserId, escalationId, request);
        return ResponseEntity.ok().build();
    }
}
