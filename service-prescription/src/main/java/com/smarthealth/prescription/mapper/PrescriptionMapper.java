package com.smarthealth.prescription.mapper;

import com.smarthealth.prescription.dto.*;
import com.smarthealth.prescription.entity.Prescription;
import com.smarthealth.prescription.entity.PrescriptionItem;

public class PrescriptionMapper {

    private PrescriptionMapper() {}

    public static PrescriptionResponse toResponse(Prescription prescription) {
        return new PrescriptionResponse(
                prescription.getId(),
                prescription.getAppointmentId(),
                prescription.getPatientId(),
                prescription.getDoctorId(),
                prescription.getDiagnosis(),
                prescription.getClinicalNotes(),
                prescription.getStatus(),
                prescription.isFollowUpRequired(),
                prescription.getFollowUpDate(),
                prescription.getIssuedAt(),
                prescription.getItems().stream().map(PrescriptionMapper::toItemResponse).toList(),
                prescription.getCreatedAt(),
                prescription.getUpdatedAt()
        );
    }

    public static PrescriptionItemResponse toItemResponse(PrescriptionItem item) {
        return new PrescriptionItemResponse(
                item.getId(),
                item.getMedicineName(),
                item.getDosage(),
                item.getFrequency(),
                item.getDuration(),
                item.getInstructions(),
                item.getQuantity()
        );
    }
}
