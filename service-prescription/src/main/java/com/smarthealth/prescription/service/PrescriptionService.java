package com.smarthealth.prescription.service;

import com.smarthealth.prescription.dto.CreatePrescriptionRequest;
import com.smarthealth.prescription.dto.PrescriptionResponse;
import com.smarthealth.prescription.dto.UpdatePrescriptionRequest;
import com.smarthealth.prescription.dto.UpdatePrescriptionStatusRequest;

import java.util.List;
import java.util.UUID;

public interface PrescriptionService {

    PrescriptionResponse createPrescription(CreatePrescriptionRequest request);

    PrescriptionResponse getById(UUID id);

    PrescriptionResponse getByAppointmentId(UUID appointmentId);

    List<PrescriptionResponse> getByPatientId(UUID patientId);

    List<PrescriptionResponse> getByDoctorId(UUID doctorId);

    PrescriptionResponse updatePrescription(UUID id, UpdatePrescriptionRequest request);

    PrescriptionResponse updateStatus(UUID id, UpdatePrescriptionStatusRequest request);

    void deletePrescription(UUID id);
}
