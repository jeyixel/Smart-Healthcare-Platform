package com.smarthealth.patient.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        List<String> details = ex.getBindingResult().getFieldErrors().stream()
                .map(this::formatFieldError)
                .toList();

        return build("Validation failed", HttpStatus.BAD_REQUEST, details);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex) {
        return build(ex.getMessage(), HttpStatus.NOT_FOUND, List.of());
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiError> handleConflict(DuplicateResourceException ex) {
        return build(ex.getMessage(), HttpStatus.CONFLICT, List.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex) {
        return build("Unexpected error", HttpStatus.INTERNAL_SERVER_ERROR, List.of(ex.getMessage()));
    }

    private ResponseEntity<ApiError> build(String message, HttpStatus status, List<String> details) {
        return ResponseEntity.status(status)
                .body(new ApiError(message, status.value(), OffsetDateTime.now(), details));
    }

    private String formatFieldError(FieldError error) {
        String defaultMessage = error.getDefaultMessage() == null ? "Invalid value" : error.getDefaultMessage();
        return error.getField() + ": " + defaultMessage;
    }
}
