package com.smarthealth.admin.dto;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@Builder
public class SystemEventResponse {
    private String id;
    private String actionType;
    private String requestedBy;
    private String description;
    private OffsetDateTime timestamp;
}
