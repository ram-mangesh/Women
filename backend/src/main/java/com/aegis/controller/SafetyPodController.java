package com.aegis.controller;

import com.aegis.entity.SafetyPod;
import com.aegis.repository.SafetyPodRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/v1/pods")
@RequiredArgsConstructor
@Tag(name = "SafetyPods", description = "Endpoints for creating and joining safety pods")
public class SafetyPodController {

    private final SafetyPodRepository podRepository;
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    @GetMapping
    @Operation(summary = "Get all safety pods or user-specific pods")
    public ResponseEntity<List<SafetyPod>> getAllPods(@RequestParam(required = false) String userName) {
        if (userName == null || userName.trim().isEmpty()) {
            return ResponseEntity.ok(podRepository.findAll());
        }
        return ResponseEntity.ok(podRepository.findUserPods(userName.trim()));
    }

    @PostMapping("/create")
    @Operation(summary = "Create a new safety pod")
    public ResponseEntity<SafetyPod> createPod(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String userName = body.get("userName");
        
        if (name == null || name.trim().isEmpty()) {
            name = "Group Safety Pod";
        }
        if (userName == null || userName.trim().isEmpty()) {
            userName = "Anonymous User";
        }

        // Generate unique 6-character code
        String code;
        do {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
            }
            code = sb.toString();
        } while (podRepository.findByCode(code).isPresent());

        SafetyPod pod = SafetyPod.builder()
                .name(name.trim())
                .code(code)
                .members(1)
                .active(true)
                .creatorName(userName.trim())
                .memberNames(userName.trim())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(podRepository.save(pod));
    }

    @PostMapping("/join")
    @Operation(summary = "Join an existing safety pod by code")
    public ResponseEntity<SafetyPod> joinPod(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        String userName = body.get("userName");
        
        if (code == null || code.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (userName == null || userName.trim().isEmpty()) {
            userName = "Anonymous User";
        }

        Optional<SafetyPod> optionalPod = podRepository.findByCode(code.trim().toUpperCase());
        if (optionalPod.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SafetyPod pod = optionalPod.get();
        String currentMembers = pod.getMemberNames() != null ? pod.getMemberNames() : "";
        
        // Append user to members list if they haven't joined yet
        if (!currentMembers.contains(userName.trim())) {
            if (currentMembers.isEmpty()) {
                pod.setMemberNames(userName.trim());
            } else {
                pod.setMemberNames(currentMembers + "," + userName.trim());
            }
            pod.setMembers(Math.min(pod.getMembers() + 1, 6));
        }
        
        pod.setActive(true);

        return ResponseEntity.ok(podRepository.save(pod));
    }

    @PostMapping("/{code}/sos")
    @Operation(summary = "Trigger SOS inside a safety pod")
    public ResponseEntity<SafetyPod> triggerSos(@PathVariable String code, @RequestBody Map<String, String> body) {
        String userName = body.get("userName");
        if (userName == null || userName.trim().isEmpty()) {
            userName = "Anonymous User";
        }

        Optional<SafetyPod> optionalPod = podRepository.findByCode(code.trim().toUpperCase());
        if (optionalPod.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SafetyPod pod = optionalPod.get();
        pod.setSosTriggeredBy(userName.trim());
        return ResponseEntity.ok(podRepository.save(pod));
    }

    @PostMapping("/{code}/sos/resolve")
    @Operation(summary = "Resolve SOS inside a safety pod")
    public ResponseEntity<SafetyPod> resolveSos(@PathVariable String code) {
        Optional<SafetyPod> optionalPod = podRepository.findByCode(code.trim().toUpperCase());
        if (optionalPod.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SafetyPod pod = optionalPod.get();
        pod.setSosTriggeredBy(null);
        return ResponseEntity.ok(podRepository.save(pod));
    }

    @DeleteMapping("/{code}")
    @Operation(summary = "Delete an existing safety pod (creator only)")
    public ResponseEntity<Void> deletePod(@PathVariable String code, @RequestParam String userName) {
        Optional<SafetyPod> optionalPod = podRepository.findByCode(code.trim().toUpperCase());
        if (optionalPod.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SafetyPod pod = optionalPod.get();
        if (!pod.getCreatorName().equalsIgnoreCase(userName.trim())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        podRepository.delete(pod);
        return ResponseEntity.ok().build();
    }
}
