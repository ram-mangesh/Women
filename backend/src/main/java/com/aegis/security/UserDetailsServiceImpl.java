package com.aegis.security;

import com.aegis.entity.User;
import com.aegis.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository users;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User u = users.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        return new org.springframework.security.core.userdetails.User(
            u.getEmail(),
            u.getPasswordHash(),
            u.getIsActive(),
            true, true, true,
            List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole().name()))
        );
    }
}
