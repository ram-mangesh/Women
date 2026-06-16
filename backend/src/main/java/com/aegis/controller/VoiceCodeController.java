package com.aegis.controller;

import com.aegis.entity.User;
import com.aegis.entity.VoiceCode;
import com.aegis.exception.NotFoundException;
import com.aegis.repository.UserRepository;
import com.aegis.repository.VoiceCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/v1/voice-code")
@RequiredArgsConstructor
public class VoiceCodeController {

    private final VoiceCodeRepository voiceCodeRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    private UUID uid(UserDetails p) {
        return userRepo.findByEmail(p.getUsername()).orElseThrow().getId();
    }

    /** Build a masked hint: "Call Mom" → "C**l M**" */
    private String buildHint(String phrase) {
        if (phrase == null || phrase.isBlank()) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < phrase.length(); i++) {
            char c = phrase.charAt(i);
            if (c == ' ') sb.append(' ');
            else if (i == 0 || (i > 0 && phrase.charAt(i - 1) == ' ')) sb.append(c); // first char of each word visible
            else sb.append('*');
        }
        return sb.toString();
    }

    /** POST /v1/voice-code — save or update the secret phrase */
    @PostMapping
    public ResponseEntity<Map<String, Object>> savePhrase(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody Map<String, String> body) {

        String phrase = body.get("phrase");
        if (phrase == null || phrase.isBlank() || phrase.trim().length() < 3) {
            return ResponseEntity.badRequest().body(Map.of("error", "Phrase must be at least 3 characters"));
        }

        UUID userId = uid(principal);
        User user = userRepo.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));

        // Deactivate any existing phrase
        voiceCodeRepo.findByUserIdAndActiveTrue(userId).ifPresent(vc -> {
            vc.setActive(false);
            voiceCodeRepo.save(vc);
        });

        // Save new hashed phrase
        VoiceCode vc = VoiceCode.builder()
                .user(user)
                .phraseHash(passwordEncoder.encode(phrase.trim().toLowerCase()))
                .phraseHint(buildHint(phrase.trim()))
                .phraseLength(phrase.trim().length())
                .active(true)
                .build();

        voiceCodeRepo.save(vc);

        return ResponseEntity.ok(Map.of(
                "message", "Secret phrase saved successfully",
                "hint", vc.getPhraseHint(),
                "active", true
        ));
    }

    /** GET /v1/voice-code — get current phrase hint */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getPhrase(
            @AuthenticationPrincipal UserDetails principal) {

        UUID userId = uid(principal);
        Optional<VoiceCode> vc = voiceCodeRepo.findByUserIdAndActiveTrue(userId);

        if (vc.isEmpty()) {
            return ResponseEntity.ok(Map.of("active", false, "hint", ""));
        }

        return ResponseEntity.ok(Map.of(
                "active", true,
                "hint", vc.get().getPhraseHint(),
                "phraseLength", vc.get().getPhraseLength()
        ));
    }

    /** POST /v1/voice-code/verify — check if spoken text matches saved phrase */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPhrase(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody Map<String, String> body) {

        String spoken = body.get("spoken");
        if (spoken == null || spoken.isBlank()) {
            return ResponseEntity.ok(Map.of("match", false));
        }

        UUID userId = uid(principal);
        Optional<VoiceCode> vcOpt = voiceCodeRepo.findByUserIdAndActiveTrue(userId);

        if (vcOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("match", false, "reason", "No phrase configured"));
        }

        boolean match = passwordEncoder.matches(spoken.trim().toLowerCase(), vcOpt.get().getPhraseHash());
        return ResponseEntity.ok(Map.of("match", match));
    }

    /** DELETE /v1/voice-code — disable/remove phrase */
    @DeleteMapping
    public ResponseEntity<Map<String, Object>> deletePhrase(
            @AuthenticationPrincipal UserDetails principal) {

        UUID userId = uid(principal);
        voiceCodeRepo.findByUserIdAndActiveTrue(userId).ifPresent(vc -> {
            vc.setActive(false);
            voiceCodeRepo.save(vc);
        });

        return ResponseEntity.ok(Map.of("message", "Secret phrase removed"));
    }
}
