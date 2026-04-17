package com.smarthealth.doctor.mapper;

import com.smarthealth.doctor.dto.*;
import com.smarthealth.doctor.entity.Doctor;
import com.smarthealth.doctor.entity.DoctorAvailability;

import java.util.List;

public class DoctorMapper {

    private DoctorMapper() {}

    public static DoctorResponse toResponse(Doctor doctor) {
        return new DoctorResponse(
                doctor.getId(),
                doctor.getUserId(),
                doctor.getFullName(),
                doctor.getEmail(),
                doctor.getPhone(),
                doctor.getSpecialty(),
                doctor.getCategory(),
                doctor.getQualification(),
                doctor.getExperienceYears(),
                doctor.getHospitalOrClinic(),
                doctor.getConsultationFee(),
                doctor.getConsultationMode(),
                doctor.getBio(),
                doctor.getProfileImageUrl(),
                doctor.getLicenseNumber(),
                doctor.isVerified(),
                doctor.isActive(),
                doctor.getAvailabilities().stream().map(DoctorMapper::toAvailabilityResponse).toList(),
                doctor.getCreatedAt(),
                doctor.getUpdatedAt()
        );
    }

    public static DoctorSearchResponse toSearchResponse(Doctor doctor) {
        return new DoctorSearchResponse(
                doctor.getId(),
                doctor.getFullName(),
                doctor.getSpecialty(),
                doctor.getCategory(),
                doctor.getQualification(),
                doctor.getExperienceYears(),
                doctor.getHospitalOrClinic(),
                doctor.getConsultationFee(),
                doctor.getConsultationMode(),
                doctor.isVerified(),
                doctor.isActive(),
                doctor.getProfileImageUrl()
        );
    }

    public static DoctorAvailabilityResponse toAvailabilityResponse(DoctorAvailability availability) {
        return new DoctorAvailabilityResponse(
                availability.getId(),
                availability.getDayOfWeek(),
                availability.getStartTime(),
                availability.getEndTime(),
                availability.getStatus()
        );
    }

    public static List<DoctorAvailability> toAvailabilityEntities(List<DoctorAvailabilityRequest> requests, Doctor doctor) {
        return requests.stream().map(req ->
                DoctorAvailability.builder()
                        .doctor(doctor)
                        .dayOfWeek(req.dayOfWeek())
                        .startTime(req.startTime())
                        .endTime(req.endTime())
                        .status(req.status())
                        .build()
        ).toList();
    }
}
