package com.smarthealth.appointment.event;

import java.util.UUID;

public record OnlineAppointmentCreatedEvent(
        UUID appointmentId,
        UUID patientId,
        UUID doctorId
) {
}

