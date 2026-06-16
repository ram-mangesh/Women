package com.aegis.config;

import com.aegis.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(c -> {})
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/v1/auth/**",
                    "/v1/sos/twiml/**",
                    "/v1/sos/active",
                    "/v1/sos/trigger",
                    "/v1/sos/*/resolve",
                    "/v1/pods/**",
                    "/v1/tracking/active-responders",
                    "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
                    "/actuator/health", "/actuator/info"
                ).permitAll()
                .requestMatchers(HttpMethod.GET, "/v1/incidents", "/v1/incidents/**").permitAll()
                .requestMatchers("/v1/admin/**").hasRole("ADMIN")
                .requestMatchers("/v1/police/**").hasAnyRole("ADMIN", "POLICE")
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider p = new DaoAuthenticationProvider();
        p.setUserDetailsService(userDetailsService);
        p.setPasswordEncoder(passwordEncoder());
        return p;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // ALLOWED_ORIGINS: comma-separated list of allowed origins.
        // Set this env var to your Vercel URL + Cloudflare tunnel URL.
        // Example: "https://aegis.vercel.app,https://my-tunnel.trycloudflare.com"
        // Defaults to localhost ports for local development.
        String rawOrigins = System.getenv("ALLOWED_ORIGINS");
        List<String> origins;
        if (rawOrigins != null && !rawOrigins.isBlank()) {
            origins = Arrays.stream(rawOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
        } else {
            origins = List.of(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:4173"
            );
        }

        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOriginPatterns(origins);
        cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}
