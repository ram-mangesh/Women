package com.aegis.dto.request;

import com.aegis.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank @Size(min = 2, max = 120) String fullName,
    @NotBlank @Email String email,
    @Size(min = 8, max = 30) String phone,
    @NotBlank @Size(min = 8) String password,
    User.Role role,
    String bloodGroup,
    String medicalInfo
) {}
