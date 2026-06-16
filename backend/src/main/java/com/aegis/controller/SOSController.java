package com.aegis.controller;

import com.aegis.dto.request.LocationUpdateRequest;
import com.aegis.dto.request.SOSRequest;
import com.aegis.dto.response.SOSAlertResponse;
import com.aegis.entity.User;
import com.aegis.repository.UserRepository;
import com.aegis.service.SOSService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/sos")
@RequiredArgsConstructor
@Tag(name = "SOS", description = "Emergency SOS triggers and management")
public class SOSController {

    private final SOSService sos;
    private final UserRepository users;

    @PostMapping
    @Operation(summary = "Trigger an SOS alert")
    public ResponseEntity<SOSAlertResponse> trigger(
        @AuthenticationPrincipal UserDetails principal,
        @Valid @RequestBody SOSRequest r
    ) {
        System.out.println(">>> [BACKEND] SOSController.trigger() HIT! User: " + (principal != null ? principal.getUsername() : "null"));
        System.out.println(">>> [BACKEND] Payload: " + r);
        UUID uid = users.findByEmail(principal.getUsername()).orElseThrow().getId();
        SOSAlertResponse response = sos.trigger(uid, r);
        System.out.println(">>> [BACKEND] SOSController.trigger() SUCCESS! Generated alert: " + response.id());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/resolve")
    @Operation(summary = "Mark an alert resolved")
    public ResponseEntity<SOSAlertResponse> resolve(
        @PathVariable UUID id,
        @AuthenticationPrincipal UserDetails principal
    ) {
        UUID uid = null;
        if (principal != null) {
            uid = users.findByEmail(principal.getUsername()).orElse(null) != null
                ? users.findByEmail(principal.getUsername()).get().getId()
                : null;
        }
        return ResponseEntity.ok(sos.resolve(id, uid));
    }

    @GetMapping("/active")
    @Operation(summary = "List all active/escalated alerts")
    public ResponseEntity<List<SOSAlertResponse>> active() {
        return ResponseEntity.ok(sos.activeAlerts());
    }

    @PostMapping("/location")
    @Operation(summary = "Push a GPS location update")
    public ResponseEntity<Void> location(
        @AuthenticationPrincipal UserDetails principal,
        @Valid @RequestBody LocationUpdateRequest r
    ) {
        UUID uid = users.findByEmail(principal.getUsername()).orElseThrow().getId();
        sos.updateLocation(uid, r);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/contacts")
    @Operation(summary = "Get user emergency contacts")
    public ResponseEntity<List<java.util.Map<String, Object>>> getContacts(
        @AuthenticationPrincipal UserDetails principal
    ) {
        UUID uid = users.findByEmail(principal.getUsername()).orElseThrow().getId();
        List<com.aegis.entity.EmergencyContact> list = sos.getContacts(uid);
        List<java.util.Map<String, Object>> out = new java.util.ArrayList<>();
        for (var c : list) {
            java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("id", c.getId().toString());
            m.put("name", c.getName());
            m.put("relation", c.getRelation());
            m.put("phone", c.getPhone());
            m.put("email", c.getEmail());
            m.put("priority", c.getPriority());
            out.add(m);
        }
        return ResponseEntity.ok(out);
    }

    @PostMapping("/contacts")
    @Operation(summary = "Add an emergency contact")
    public ResponseEntity<java.util.Map<String, Object>> addContact(
        @AuthenticationPrincipal UserDetails principal,
        @Valid @RequestBody com.aegis.dto.request.EmergencyContactRequest r
    ) {
        UUID uid = users.findByEmail(principal.getUsername()).orElseThrow().getId();
        com.aegis.entity.EmergencyContact c = sos.addContact(uid, r);
        java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
        m.put("id", c.getId().toString());
        m.put("name", c.getName());
        m.put("relation", c.getRelation());
        m.put("phone", c.getPhone());
        m.put("email", c.getEmail());
        m.put("priority", c.getPriority());
        return ResponseEntity.ok(m);
    }

    @DeleteMapping("/contacts/{id}")
    @Operation(summary = "Delete an emergency contact")
    public ResponseEntity<Void> deleteContact(
        @PathVariable UUID id,
        @AuthenticationPrincipal UserDetails principal
    ) {
        UUID uid = users.findByEmail(principal.getUsername()).orElseThrow().getId();
        sos.deleteContact(uid, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/twiml/{alertId}", produces = "application/xml")
    @Operation(summary = "Generate TwiML XML voice instructions for Twilio")
    @ResponseBody
    public String getTwiML(@PathVariable UUID alertId) {
        return sos.generateTwiML(alertId);
    }
}
