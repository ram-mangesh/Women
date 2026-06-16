package com.aegis.exception;

import com.aegis.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(AegisException.class)
    public ResponseEntity<ErrorResponse> handle(AegisException ex, HttpServletRequest req) {
        log.warn("AegisException: {}", ex.getMessage());
        return ResponseEntity.status(ex.getStatus())
            .body(ErrorResponse.of(ex.getStatus(), "Business Error", ex.getMessage(), req.getRequestURI()));
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException ex, HttpServletRequest req) {
        return ResponseEntity.status(404)
            .body(ErrorResponse.of(404, "Not Found", ex.getMessage(), req.getRequestURI()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCreds(BadCredentialsException ex, HttpServletRequest req) {
        return ResponseEntity.status(401)
            .body(ErrorResponse.of(401, "Unauthorized", "Invalid email or password", req.getRequestURI()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccess(AccessDeniedException ex, HttpServletRequest req) {
        return ResponseEntity.status(403)
            .body(ErrorResponse.of(403, "Forbidden", "Insufficient permissions", req.getRequestURI()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> errs = new HashMap<>();
        for (FieldError e : ex.getFieldErrors()) errs.put(e.getField(), e.getDefaultMessage());
        return ResponseEntity.status(400)
            .body(new ErrorResponse(400, "Validation Failed", "Invalid request", req.getRequestURI(), System.currentTimeMillis(), errs));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest req) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(500)
            .body(ErrorResponse.of(500, "Server Error", "Something went wrong", req.getRequestURI()));
    }
}
