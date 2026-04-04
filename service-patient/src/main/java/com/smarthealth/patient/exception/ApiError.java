package com.smarthealth.patient.exception;

import java.time.OffsetDateTime;
import java.util.List;

public record ApiError(
        String message,
        int status,
        OffsetDateTime timestamp,
        List<String> details
) {
}
