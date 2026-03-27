package com.smarthealth.appointment.service;
import com.smarthealth.appointment.dto.*;
import com.smarthealth.appointment.entity.Appointment;
import com.smarthealth.appointment.entity.AppointmentStatus;
import com.smarthealth.appointment.exception.BusinessException;
import com.smarthealth.appointment.exception.ResourceNotFoundException;
import com.smarthealth.appointment.mapper.AppointmentMapper;
import com.smarthealth.appointment.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;

    @Override
    public AppointmentResponse create(CreateAppointmentRequest request) {
        boolean doctorAlreadyBooked = appointmentRepository
                .existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusIn(
                        request.doctorId(),
                        request.appointmentDate(),
                        request.appointmentTime(),
                        List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)
                );

        if (doctorAlreadyBooked) {
            throw new BusinessException("Doctor already has an appointment at the selected date and time");
        }

        Appointment appointment = Appointment.builder()
                .patientId(request.patientId())
                .doctorId(request.doctorId())
                .appointmentDate(request.appointmentDate())
                .appointmentTime(request.appointmentTime())
                .consultationType(request.consultationType())
                .reason(request.reason())
                .status(AppointmentStatus.PENDING)
                .build();

        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getById(UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));

        return AppointmentMapper.toResponse(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAll(UUID patientId, UUID doctorId, String status) {
        List<Appointment> appointments;

        if (patientId != null) {
            appointments = appointmentRepository.findByPatientId(patientId);
        } else if (doctorId != null) {
            appointments = appointmentRepository.findByDoctorId(doctorId);
        } else if (status != null) {
            appointments = appointmentRepository.findByStatus(AppointmentStatus.valueOf(status.toUpperCase()));
        } else {
            appointments = appointmentRepository.findAll();
        }

        return appointments.stream()
                .map(AppointmentMapper::toResponse)
                .toList();
    }

    @Override
    public AppointmentResponse updateStatus(UUID id, UpdateAppointmentStatusRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED ||
                appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BusinessException("Finalized appointments cannot be modified");
        }

        appointment.setStatus(request.status());
        appointment.setNotes(request.notes());

        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    public AppointmentResponse reschedule(UUID id, RescheduleAppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED ||
                appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BusinessException("Finalized appointments cannot be rescheduled");
        }

        boolean doctorAlreadyBooked = appointmentRepository
                .existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusIn(
                        appointment.getDoctorId(),
                        request.appointmentDate(),
                        request.appointmentTime(),
                        List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)
                );

        if (doctorAlreadyBooked &&
                (!appointment.getAppointmentDate().equals(request.appointmentDate()) ||
                        !appointment.getAppointmentTime().equals(request.appointmentTime()))) {
            throw new BusinessException("Doctor already has an appointment at the selected new date and time");
        }

        appointment.setAppointmentDate(request.appointmentDate());
        appointment.setAppointmentTime(request.appointmentTime());
        appointment.setStatus(AppointmentStatus.PENDING);

        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    public void delete(UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));

        appointmentRepository.delete(appointment);
    }
}
