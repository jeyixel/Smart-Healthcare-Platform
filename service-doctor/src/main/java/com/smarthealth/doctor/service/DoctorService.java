package com.smarthealth.doctor.service;

import com.smarthealth.doctor.dto.*;

import java.util.List;
import java.util.UUID;

public interface DoctorService {
    DoctorResponse createDoctor(CreateDoctorRequest request);

    DoctorResponse getDoctorById(UUID id);

    DoctorResponse getDoctorByUserId(UUID userId);

    DoctorResponse updateDoctor(UUID id, UpdateDoctorRequest request);

    DoctorResponse verifyDoctor(UUID id, boolean verified);

    DoctorResponse changeActiveStatus(UUID id, boolean active);

    DoctorResponse replaceAvailability(UUID doctorId, List<DoctorAvailabilityRequest> requests);

    List<DoctorSearchResponse> searchDoctors(String specialty, String category, String consultationMode);

    List<DoctorSearchResponse> listVerifiedActiveDoctors();

    void deleteDoctor(UUID id);
}
