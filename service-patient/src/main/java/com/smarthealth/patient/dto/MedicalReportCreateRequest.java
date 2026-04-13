package com.smarthealth.patient.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class MedicalReportCreateRequest {

    @NotBlank(message = "Report type is required")
    @Size(max = 100, message = "Report type must be less than 100 characters")
    private String reportType;

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be less than 200 characters")
    private String title;

    @NotBlank(message = "Storage key is required")
    @Size(max = 400, message = "Storage key must be less than 400 characters")
    private String storageKey;

    @NotBlank(message = "File name is required")
    @Size(max = 200, message = "File name must be less than 200 characters")
    private String fileName;

    @NotBlank(message = "MIME type is required")
    @Size(max = 100, message = "MIME type must be less than 100 characters")
    private String mimeType;

    @Min(value = 1, message = "File size must be at least 1 byte")
    private long fileSize;

    @Size(max = 128, message = "Checksum must be less than 128 characters")
    private String checksum;

    @NotBlank(message = "Uploader role is required")
    @Size(max = 50, message = "Uploader role must be less than 50 characters")
    private String uploadedByRole;

    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public void setStorageKey(String storageKey) {
        this.storageKey = storageKey;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public long getFileSize() {
        return fileSize;
    }

    public void setFileSize(long fileSize) {
        this.fileSize = fileSize;
    }

    public String getChecksum() {
        return checksum;
    }

    public void setChecksum(String checksum) {
        this.checksum = checksum;
    }

    public String getUploadedByRole() {
        return uploadedByRole;
    }

    public void setUploadedByRole(String uploadedByRole) {
        this.uploadedByRole = uploadedByRole;
    }
}
