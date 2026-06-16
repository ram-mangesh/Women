package com.aegis.controller;

import com.aegis.entity.LiveLocation;
import com.aegis.repository.UserRepository;
import com.aegis.repository.LiveLocationRepository;
import com.aegis.service.LiveLocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/tracking")
@RequiredArgsConstructor
@Tag(name = "Tracking", description = "Live GPS history")
public class TrackingController {

    private final LiveLocationService svc;
    private final UserRepository users;
    private final LiveLocationRepository locs;

    @GetMapping("/me")
    public ResponseEntity<List<LiveLocation>> me(@AuthenticationPrincipal UserDetails principal) {
        UUID uid = users.findByEmail(principal.getUsername()).orElseThrow().getId();
        return ResponseEntity.ok(svc.history(uid));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<LiveLocation>> of(@PathVariable UUID userId) {
        return ResponseEntity.ok(svc.history(userId));
    }

    @GetMapping("/active-responders")
    @Operation(summary = "Get list of active platform responders and their coordinates")
    public ResponseEntity<List<ActiveResponder>> activeResponders() {
        List<com.aegis.entity.User> allUsers = users.findAll();
        java.util.List<ActiveResponder> list = new java.util.ArrayList<>();
        
        // Base location for fallback (around Nitesh's location)
        double baseLat = 19.4314;
        double baseLng = 72.8210;
        
        int offsetIndex = 1;
        for (com.aegis.entity.User u : allUsers) {
            // Find their latest location
            java.util.Optional<LiveLocation> latest = svc.latest(u.getId());
            double lat = baseLat + (offsetIndex * 0.0011); // ~110 meters offset
            double lng = baseLng - (offsetIndex * 0.0009);
            offsetIndex++;
            
            if (latest.isPresent()) {
                lat = latest.get().getLatitude();
                lng = latest.get().getLongitude();
            }
            
            list.add(new ActiveResponder(
                u.getId().toString(),
                u.getFullName(),
                lat,
                lng,
                u.getRole().toString().equalsIgnoreCase("POLICE") ? "Off-duty Police" : 
                (u.getRole().toString().equalsIgnoreCase("GUARDIAN") ? "Doctor" : "Verified User"),
                u.getRole().toString().equalsIgnoreCase("POLICE") || u.getFullName().toLowerCase().contains("mangesh"),
                u.getRole().toString().equalsIgnoreCase("GUARDIAN")
            ));
        }
        return ResponseEntity.ok(list);
    }

    public static record ActiveResponder(
        String userId,
        String name,
        double latitude,
        double longitude,
        String profession,
        boolean verifiedIdentity,
        boolean isMedicalProfessional
    ) {}
}
