package com.aegis.controller;

import com.aegis.entity.SafeRideSession;
import com.aegis.repository.UserRepository;
import com.aegis.service.SafeRideService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/v1/safe-ride")
@RequiredArgsConstructor
public class SafeRideController {

    private final SafeRideService safeRideService;
    private final UserRepository userRepo;

    private UUID uid(UserDetails p) {
        return userRepo.findByEmail(p.getUsername()).orElseThrow().getId();
    }

    /** Convert entity to safe DTO — avoids lazy User serialization crash */
    private Map<String, Object> toDto(SafeRideSession s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", s.getId().toString());
        m.put("vehicleNumber", s.getVehicleNumber());
        m.put("driverName", s.getDriverName());
        m.put("driverMobile", s.getDriverMobile());
        m.put("driverVerified", s.getDriverVerified());
        m.put("sourceLocation", s.getSourceLocation());
        m.put("destinationLocation", s.getDestinationLocation());
        m.put("status", s.getStatus() != null ? s.getStatus().name() : null);
        m.put("startTime", s.getStartTime());
        m.put("endTime", s.getEndTime());
        return m;
    }

    @PostMapping("/driver-otp/send")
    public ResponseEntity<Map<String, String>> sendOtp(@RequestBody Map<String, String> body) {
        String mobile = body.get("mobile");
        if (mobile == null || mobile.isBlank()) return ResponseEntity.badRequest().build();
        safeRideService.sendDriverOtp(mobile);
        return ResponseEntity.ok(Map.of("message", "OTP sent"));
    }

    @PostMapping("/driver-otp/verify")
    public ResponseEntity<Map<String, Boolean>> verifyOtp(@RequestBody Map<String, String> body) {
        String mobile = body.get("mobile");
        String otp = body.get("otp");
        boolean valid = safeRideService.verifyDriverOtp(mobile, otp);
        return ResponseEntity.ok(Map.of("verified", valid));
    }

    @PostMapping("/start")
    public ResponseEntity<Map<String, Object>> startRide(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody SafeRideSession request) {
        SafeRideSession saved = safeRideService.startJourney(uid(principal), request);
        return ResponseEntity.ok(toDto(saved));
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActiveRide(@AuthenticationPrincipal UserDetails principal) {
        Optional<SafeRideSession> ride = safeRideService.getActiveRide(uid(principal));
        if (ride.isPresent()) {
            return ResponseEntity.ok(toDto(ride.get()));
        }
        return ResponseEntity.ok(Map.of("active", false));
    }

    @PostMapping("/{id}/location")
    public ResponseEntity<Map<String, Object>> updateLocation(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        String latLng = body.get("location");
        SafeRideSession updated = safeRideService.updateLocation(id, latLng);
        return ResponseEntity.ok(toDto(updated));
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<Map<String, String>> endRide(@PathVariable UUID id) {
        safeRideService.endJourney(id);
        return ResponseEntity.ok(Map.of("message", "Ride ended safely"));
    }
}
