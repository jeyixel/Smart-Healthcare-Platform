package com.smarthealth.admin.controller;

import com.smarthealth.admin.dto.SupportMessageRequest;
import com.smarthealth.admin.dto.SupportMessageResponse;
import com.smarthealth.admin.model.SupportMessage;
import com.smarthealth.admin.repository.SupportMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/support/chat")
@RequiredArgsConstructor
public class SupportChatController {

    private final SupportMessageRepository messageRepository;

    @PostMapping("/send")
    public ResponseEntity<SupportMessageResponse> sendMessage(@RequestBody SupportMessageRequest request, Authentication authentication) {
        String senderEmail = authentication.getName();
        
        SupportMessage message = SupportMessage.builder()
                .senderEmail(senderEmail)
                .recipientEmail(request.getRecipientEmail())
                .content(request.getContent())
                .timestamp(LocalDateTime.now())
                .read(false)
                .build();
        
        SupportMessage saved = messageRepository.save(message);
        return ResponseEntity.ok(toResponse(saved));
    }

    @GetMapping("/history")
    public ResponseEntity<List<SupportMessageResponse>> getHistory(@RequestParam String withEmail, Authentication authentication) {
        String myEmail = authentication.getName();
        List<SupportMessage> messages = messageRepository.findChatHistory(myEmail, withEmail);
        
        // Mark as read if I am the recipient
        messages.stream()
                .filter(m -> m.getRecipientEmail().equals(myEmail) && !m.isRead())
                .forEach(m -> {
                    m.setRead(true);
                    messageRepository.save(m);
                });

        return ResponseEntity.ok(messages.stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<String>> getConversations(Authentication authentication) {
        String myEmail = authentication.getName();
        // Simple implementation: find everyone who messaged me or I messaged
        // For admin, we primarily want to see patients who sent messages
        List<String> senders = messageRepository.findUniqueSendersToAdmin(myEmail);
        return ResponseEntity.ok(senders);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        return ResponseEntity.ok(messageRepository.countByRecipientEmailAndReadFalse(authentication.getName()));
    }

    private SupportMessageResponse toResponse(SupportMessage message) {
        return SupportMessageResponse.builder()
                .id(message.getId())
                .senderEmail(message.getSenderEmail())
                .recipientEmail(message.getRecipientEmail())
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .read(message.isRead())
                .build();
    }
}
