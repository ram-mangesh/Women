package com.aegis.service;

import com.aegis.dto.request.LoginRequest;
import com.aegis.dto.request.RegisterRequest;
import com.aegis.dto.response.AuthResponse;
import com.aegis.entity.User;
import com.aegis.exception.AegisException;
import com.aegis.repository.UserRepository;
import com.aegis.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest r) {
        if (users.existsByEmail(r.email())) {
            throw new AegisException(409, "Email already registered");
        }
        User u = User.builder()
            .fullName(r.fullName())
            .email(r.email())
            .phone(r.phone())
            .passwordHash(encoder.encode(r.password()))
            .role(r.role() != null ? r.role() : User.Role.USER)
            .bloodGroup(r.bloodGroup())
            .medicalInfo(r.medicalInfo())
            .build();
        users.save(u);

        UserDetails ud = org.springframework.security.core.userdetails.User
            .withUsername(u.getEmail()).password(u.getPasswordHash())
            .roles(u.getRole().name()).build();
        return buildTokens(u, ud);
    }

    public AuthResponse login(LoginRequest r) {
        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(r.email(), r.password())
        );
        UserDetails ud = (UserDetails) auth.getPrincipal();
        User u = users.findByEmail(r.email()).orElseThrow();
        return buildTokens(u, ud);
    }

    public AuthResponse refresh(String refreshToken) {
        String email = jwtService.extractEmail(refreshToken);
        User u = users.findByEmail(email).orElseThrow(() -> new AegisException(401, "Invalid refresh"));
        UserDetails ud = org.springframework.security.core.userdetails.User
            .withUsername(u.getEmail()).password(u.getPasswordHash())
            .roles(u.getRole().name()).build();
        return buildTokens(u, ud);
    }

    private AuthResponse buildTokens(User u, UserDetails ud) {
        String access = jwtService.generateAccessToken(ud);
        String refresh = jwtService.generateRefreshToken(ud);
        return AuthResponse.of(access, refresh, 900_000, u);
    }
}
