package com.smarthealth.doctor.service;

import com.smarthealth.doctor.dto.*;
import com.smarthealth.doctor.entity.Doctor;
import com.smarthealth.doctor.entity.DoctorAvailability;
import com.smarthealth.doctor.exception.BusinessException;
import com.smarthealth.doctor.exception.ResourceNotFoundException;
import com.smarthealth.doctor.mapper.DoctorMapper;
import com.smarthealth.doctor.repository.DoctorAvailabilityRepository;
import com.smarthealth.doctor.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorServiceImpl implements DoctorService{

    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;

    @Override
    public DoctorResponse createDoctor(CreateDoctorRequest request) {
        if (doctorRepository.existsByUserId(request.userId())) {
            throw new BusinessException("Doctor profile already exists for this user");
        }
        if (doctorRepository.existsByEmail(request.email())) {
            throw new BusinessException("Email is already used by another doctor");
        }
        if (doctorRepository.existsByLicenseNumber(request.licenseNumber())) {
            throw new BusinessException("License number already exists");
        }

        Doctor doctor = Doctor.builder()
                .userId(request.userId())
                .fullName(request.fullName())
                .email(request.email())
                .phone(request.phone())
                .specialty(request.specialty())
                .category(request.category())
                .qualification(request.qualification())
                .experienceYears(request.experienceYears())
                .hospitalOrClinic(request.hospitalOrClinic())
                .consultationFee(request.consultationFee())
                .consultationMode(request.consultationMode())
                .bio(request.bio())
                .profileImageUrl(request.profileImageUrl())
                .licenseNumber(request.licenseNumber())
                .verified(false)
                .active(true)
                .build();

        return DoctorMapper.toResponse(doctorRepository.save(doctor));
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorResponse getDoctorById(UUID id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + id));
        return DoctorMapper.toResponse(doctor);
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorResponse getDoctorByUserId(UUID userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user: " + userId));
        return DoctorMapper.toResponse(doctor);
    }

    @Override
    public DoctorResponse updateDoctor(UUID id, UpdateDoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + id));

        doctor.setFullName(request.fullName());
        doctor.setPhone(request.phone());
        doctor.setSpecialty(request.specialty());
        doctor.setCategory(request.category());
        doctor.setQualification(request.qualification());
        doctor.setExperienceYears(request.experienceYears());
        doctor.setHospitalOrClinic(request.hospitalOrClinic());
        doctor.setConsultationFee(request.consultationFee());
        doctor.setConsultationMode(request.consultationMode());
        doctor.setBio(request.bio());
        doctor.setProfileImageUrl(request.profileImageUrl());

        return DoctorMapper.toResponse(doctorRepository.save(doctor));
    }

    @Override
    public DoctorResponse verifyDoctor(UUID id, boolean verified) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + id));

        doctor.setVerified(verified);
        return DoctorMapper.toResponse(doctorRepository.save(doctor));
    }

    @Override
    public DoctorResponse changeActiveStatus(UUID id, boolean active) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + id));

        doctor.setActive(active);
        return DoctorMapper.toResponse(doctorRepository.save(doctor));
    }

    @Override
    public DoctorResponse replaceAvailability(UUID doctorId, List<DoctorAvailabilityRequest> requests) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + doctorId));

        validateAvailability(requests);

        doctor.getAvailabilities().clear();
        List<DoctorAvailability> newAvailabilities = DoctorMapper.toAvailabilityEntities(requests, doctor);
        doctor.getAvailabilities().addAll(newAvailabilities);

        Doctor saved = doctorRepository.save(doctor);
        return DoctorMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorSearchResponse> searchDoctors(String specialty, String category) {
        List<Doctor> doctors;

        if (specialty != null && category != null) {
            doctors = doctorRepository.findByVerifiedTrueAndActiveTrueAndSpecialtyIgnoreCaseAndCategoryIgnoreCase(
                    specialty, category
            );
        } else if (specialty != null) {
            doctors = doctorRepository.findByVerifiedTrueAndActiveTrueAndSpecialtyIgnoreCase(specialty);
        } else if (category != null) {
            doctors = doctorRepository.findByVerifiedTrueAndActiveTrueAndCategoryIgnoreCase(category);
        } else {
            doctors = doctorRepository.findByVerifiedTrueAndActiveTrue();
        }

        return doctors.stream().map(DoctorMapper::toSearchResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorSearchResponse> listVerifiedActiveDoctors() {
        return doctorRepository.findByVerifiedTrueAndActiveTrue()
                .stream()
                .map(DoctorMapper::toSearchResponse)
                .toList();
    }

    private void validateAvailability(List<DoctorAvailabilityRequest> requests) {
        for (DoctorAvailabilityRequest req : requests) {
            if (!req.startTime().isBefore(req.endTime())) {
                throw new BusinessException("Availability startTime must be before endTime");
            }
        }
    }
}
