package com.aegis.security;

import com.aegis.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class JwtService {

    private final SecretKey key;
    private final JwtProperties props;

    public JwtService(JwtProperties props) {
        this.props = props;
        // Pad/truncate secret to ≥32 bytes for HS256
        byte[] raw = props.secret().getBytes(StandardCharsets.UTF_8);
        this.key = Keys.hmacShaKeyFor(raw);
    }

    public String generateAccessToken(UserDetails user) {
        Map<String, Object> claims = Map.of(
            "roles", user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).collect(Collectors.toList())
        );
        return buildToken(claims, user.getUsername(), props.accessExpiryMs());
    }

    public String generateRefreshToken(UserDetails user) {
        return buildToken(Map.of("type", "refresh"), user.getUsername(), props.refreshExpiryMs());
    }

    private String buildToken(Map<String, Object> claims, String subject, long expiryMs) {
        Date now = new Date();
        return Jwts.builder()
            .claims(claims)
            .subject(subject)
            .issuer(props.issuer())
            .issuedAt(now)
            .expiration(new Date(now.getTime() + expiryMs))
            .signWith(key)
            .compact();
    }

    public String extractEmail(String token) { return extractClaim(token, Claims::getSubject); }
    public Date extractExpiration(String token) { return extractClaim(token, Claims::getExpiration); }

    public <T> T extractClaim(String token, Function<Claims, T> fn) {
        Claims claims = Jwts.parser()
            .verifyWith(key).build()
            .parseSignedClaims(token).getPayload();
        return fn.apply(claims);
    }

    public boolean isTokenValid(String token, UserDetails user) {
        try {
            final String email = extractEmail(token);
            return email.equals(user.getUsername()) && !extractExpiration(token).before(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}
