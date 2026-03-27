package com.smarthealth.appointment.service;

import com.smarthealth.appointment.dto.*;

import java.util.List;
import java.util.UUID;

public interface AppointmentService {

    AppointmentResponse create(CreateAppointmentRequest request);

    AppointmentResponse getById(UUID id);

    List<AppointmentResponse> getAll(UUID patientId, UUID doctorId, String status);

    AppointmentResponse updateStatus(UUID id, UpdateAppointmentStatusRequest request);

    AppointmentResponse reschedule(UUID id, RescheduleAppointmentRequest request);

    void delete(UUID id);

}
