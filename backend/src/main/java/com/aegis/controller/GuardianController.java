package com.aegis.controller;

import com.aegis.repository.GuardianConnectionRepository;
import com.aegis.repository.UserRepository;
import com.aegis.service.LiveLocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/v1/guardian")
@RequiredArgsConstructor
@Tag(name = "Guardian", description = "Guardian portal — monitor wards")
public class GuardianController {

    private final GuardianConnectionRepository connRepo;
    private final UserRepository users;
    private final LiveLocationService locationSvc;

    @GetMapping("/wards")
    @Operation(summary = "List all wards this guardian is watching")
    public ResponseEntity<List<Map<String, Object>>> wards(@AuthenticationPrincipal UserDetails principal) {
        var guardian = users.findByEmail(principal.getUsername()).orElseThrow();
        var conns = connRepo.findByGuardianIdAndStatus(guardian.getId(),
            com.aegis.entity.GuardianConnection.Status.ACTIVE);
        List<Map<String, Object>> out = new ArrayList<>();
        for (var c : conns) {
            var w = c.getWard();
            var lastLoc = locationSvc.latest(w.getId());
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("wardId", w.getId());
            m.put("name", w.getFullName());
            m.put("lastSeen", w.getLastSeenAt());
            m.put("location", lastLoc.orElse(null));
            out.add(m);
        }
        return ResponseEntity.ok(out);
    }
}
