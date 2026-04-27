package com.smarthealth.admin.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportMessageRequest {
    private String recipientEmail;
    private String content;
}
