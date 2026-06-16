package com.aegis.controller;

import com.aegis.dto.request.LoginRequest;
import com.aegis.dto.request.RegisterRequest;
import com.aegis.dto.response.AuthResponse;
import com.aegis.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Registration, login, token refresh")
public class AuthController {

    private final AuthService auth;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(auth.register(r));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email + password")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest r) {
        return ResponseEntity.ok(auth.login(r));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Exchange refresh token for new tokens")
    public ResponseEntity<AuthResponse> refresh(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(auth.refresh(body.get("refreshToken")));
    }
}
