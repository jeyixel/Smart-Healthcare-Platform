package com.smarthealth.admin.controller;

import com.smarthealth.admin.dto.NotificationLogResponse;
import com.smarthealth.admin.service.NotificationAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/notifications")
@RequiredArgsConstructor
public class NotificationAdminController {

    private final NotificationAdminService notificationAdminService;

    @GetMapping
    public List<NotificationLogResponse> getRecentLogs(@RequestHeader("Authorization") String token) {
        return notificationAdminService.getRecentLogs(token);
    }
}
