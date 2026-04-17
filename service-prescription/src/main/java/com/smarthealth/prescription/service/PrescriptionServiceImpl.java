package com.smarthealth.prescription.service;

import com.smarthealth.prescription.client.ServiceClient;
import com.smarthealth.prescription.dto.*;
import com.smarthealth.prescription.dto.external.AppointmentResponse;
import com.smarthealth.prescription.dto.external.DoctorResponse;
import com.smarthealth.prescription.entity.Prescription;
import com.smarthealth.prescription.entity.PrescriptionItem;
import com.smarthealth.prescription.entity.PrescriptionStatus;
import com.smarthealth.prescription.exception.BusinessException;
import com.smarthealth.prescription.exception.ResourceNotFoundException;
import com.smarthealth.prescription.mapper.PrescriptionMapper;
import com.smarthealth.prescription.repository.PrescriptionRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static com.smarthealth.prescription.entity.AppointmentStatus.CANCELLED;
import static com.smarthealth.prescription.entity.AppointmentStatus.PENDING;


@Service
@Transactional
@RequiredArgsConstructor
public class PrescriptionServiceImpl implements PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final ServiceClient serviceClient;
    private final PrescriptionEventPublisher eventPublisher;

    @Override
    public PrescriptionResponse createPrescription(CreatePrescriptionRequest request) {

        try{
            DoctorResponse doctor = serviceClient.getDoctor(request.doctorId());
            if (doctor == null) {
                throw new ResourceNotFoundException("Doctor not found: " + request.doctorId());
            }
            if (!doctor.active()) {
                throw new BusinessException("Doctor is not active: " + request.doctorId());
            }
            if (!doctor.verified()) {
                throw new BusinessException("Doctor is not verified: " + request.doctorId());
            }

            AppointmentResponse appointment  = serviceClient.getAppointment(request.appointmentId());
            if(appointment == null){
                throw new ResourceNotFoundException("Appointment not found: " + request.appointmentId());
            }
            if(appointment.status() == CANCELLED ){
                throw new BusinessException("Appointment is Cancelled, can not generate prescription for : " + request.appointmentId());
            }
            if(appointment.status() == PENDING){
                throw new BusinessException("Appointment is Pending, can not generate prescription for : " + request.appointmentId());
            }

        } catch (ResourceNotFoundException | BusinessException e) {
            // Re-throw our own exceptions
            throw e;
        } catch (Exception e) {
            throw new BusinessException("Appointment creation failed: " + e.getMessage());
        }

        if (prescriptionRepository.existsByAppointmentId(request.appointmentId())) {
            throw new BusinessException("Prescription already exists for this appointment");
        }

        if (request.followUpRequired() && request.followUpDate() == null) {
            throw new BusinessException("followUpDate is required when followUpRequired is true");
        }

         Prescription prescription = Prescription.builder()
                .appointmentId(request.appointmentId())
                .patientId(request.patientId())
                .doctorId(request.doctorId())
                .diagnosis(request.diagnosis())
                .clinicalNotes(request.clinicalNotes())
                .status(PrescriptionStatus.DRAFT)
                .followUpRequired(request.followUpRequired())
                .followUpDate(request.followUpDate())
                .digitalSignature(request.digitalSignature())
                .issuedAt(Instant.now())
                .build();

        List<PrescriptionItem> items = request.items()
                .stream()
                .map(item -> toPrescriptionItem(item, prescription))
                .toList();

        prescription.getItems().addAll(items);

        Prescription saved = prescriptionRepository.save(prescription);
        eventPublisher.publishPrescriptionEvent("prescription-created", "PRESCRIPTION_CREATED", saved);

        return PrescriptionMapper.toResponse(prescription);
    }

    @Override
    @Transactional(readOnly = true)
    public PrescriptionResponse getById(UUID id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found: " + id));

        return PrescriptionMapper.toResponse(prescription);
    }

    @Override
    @Transactional(readOnly = true)
    public PrescriptionResponse getByAppointmentId(UUID appointmentId) {
        Prescription prescription = prescriptionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found for appointment: " + appointmentId));

        return PrescriptionMapper.toResponse(prescription);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getByPatientId(UUID patientId) {
        return prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(PrescriptionMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getByDoctorId(UUID doctorId) {
        return prescriptionRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId)
                .stream()
                .map(PrescriptionMapper::toResponse)
                .toList();
    }

    @Override
    public PrescriptionResponse updatePrescription(UUID id, UpdatePrescriptionRequest request) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found: " + id));

        ensureDraftOnly(prescription);

        if (request.followUpRequired() != null) {
            prescription.setFollowUpRequired(request.followUpRequired());
        }

        if (Boolean.TRUE.equals(request.followUpRequired()) && request.followUpDate() == null && prescription.getFollowUpDate() == null) {
            throw new BusinessException("followUpDate is required when followUpRequired is true");
        }

        if (request.diagnosis() != null) {
            prescription.setDiagnosis(request.diagnosis());
        }

        if (request.clinicalNotes() != null) {
            prescription.setClinicalNotes(request.clinicalNotes());
        }

        if (request.followUpDate() != null) {
            prescription.setFollowUpDate(request.followUpDate());
        }

        if (Boolean.FALSE.equals(request.followUpRequired())) {
            prescription.setFollowUpDate(null);
        }

        if (request.digitalSignature() != null) {
            prescription.setDigitalSignature(request.digitalSignature());
        }

        if (request.items() != null) {
            if (request.items().isEmpty()) {
                throw new BusinessException("Prescription items cannot be empty when provided");
            }

            prescription.getItems().clear();

            List<PrescriptionItem> updatedItems = request.items()
                    .stream()
                    .map(item -> toPrescriptionItem(item, prescription))
                    .toList();

            prescription.getItems().addAll(updatedItems);
        }

        if (prescription.isFollowUpRequired() && prescription.getFollowUpDate() == null) {
            throw new BusinessException("followUpDate is required when followUpRequired is true");
        }

        Prescription saved = prescriptionRepository.save(prescription);
        eventPublisher.publishPrescriptionEvent("prescription-updated", "PRESCRIPTION_UPDATED", saved);

        return PrescriptionMapper.toResponse(prescription);
    }

    @Override
    public PrescriptionResponse updateStatus(UUID id, UpdatePrescriptionStatusRequest request) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found: " + id));

        if (prescription.getStatus() == PrescriptionStatus.CANCELLED) {
            throw new BusinessException("Cancelled prescription cannot be changed");
        }

        prescription.setStatus(request.status());

        if (request.status() == PrescriptionStatus.ISSUED && prescription.getIssuedAt() == null) {
            prescription.setIssuedAt(Instant.now());
        }

        prescription = prescriptionRepository.save(prescription);

        if (request.status() == PrescriptionStatus.ISSUED) {
            // Alternatively, fire an updated event when explicitly issued
            eventPublisher.publishPrescriptionEvent("prescription-updated", "PRESCRIPTION_ISSUED", prescription);
        }

        return PrescriptionMapper.toResponse(prescription);
    }

    @Override
    public void deletePrescription(UUID id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found: " + id));

        prescriptionRepository.delete(prescription);
    }

    @Override
    public boolean isPrescriptionOwnerById(UUID prescriptionId, Long userId) {
        try {
            Prescription prescription = prescriptionRepository.findById(prescriptionId)
                    .orElse(null);
            if (prescription == null) return false;

            // Check if user is the doctor of this prescription
            DoctorResponse doctor = serviceClient.getDoctor(prescription.getDoctorId());
            if (doctor.userId().equals(userId)) {
                return true;
            }

            // Check if user is the patient of this prescription
            // Note: We would need a PatientResponse DTO and ServiceClient method for this
            // For now, we'll assume patients can't directly access prescriptions through this method
            // This is consistent with the authorization pattern where patients access through patient-specific endpoints

            return false;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean isDoctorOwner(UUID doctorId, Long userId) {
        try {
            DoctorResponse doctor = serviceClient.getDoctor(doctorId);
            return doctor.userId().equals(userId);
        } catch (Exception e) {
            return false;
        }
    }

    private void ensureDraftOnly(Prescription prescription) {
        if (prescription.getStatus() != PrescriptionStatus.DRAFT) {
            throw new BusinessException("Only DRAFT prescriptions can be updated ");
        }
    }


    private PrescriptionItem toPrescriptionItem(CreatePrescriptionItemRequest item, Prescription prescription) {
        return PrescriptionItem.builder()
                .prescription(prescription)
                .medicineName(item.medicineName())
                .dosage(item.dosage())
                .frequency(item.frequency())
                .duration(item.duration())
                .instructions(item.instructions())
                .quantity(item.quantity())
                .build();
    }

}
