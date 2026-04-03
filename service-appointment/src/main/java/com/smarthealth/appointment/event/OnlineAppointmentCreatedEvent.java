package com.smarthealth.appointment.event;

import java.util.UUID;

// This file is just a simple data container. Its only job is to securely hold the three IDs
// and transport them from the place where the appointment was saved to the place where the external API request will be made.

public record OnlineAppointmentCreatedEvent(
        UUID appointmentId,
        UUID patientId,
        UUID doctorId
) {
}

