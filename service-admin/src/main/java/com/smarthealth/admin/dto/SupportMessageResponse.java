package com.smarthealth.admin.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportMessageResponse {
    private Long id;
    private String senderEmail;
    private String recipientEmail;
    private String content;
    private LocalDateTime timestamp;
    private boolean read;
}
