package com.smarthealth.notification.service;

import com.smarthealth.notification.dto.AppointmentEventDto;
import com.smarthealth.notification.dto.AppointmentNotificationEvent;
import com.smarthealth.notification.dto.PaymentEventDto;
import com.smarthealth.notification.dto.PrescriptionNotificationEvent;
import com.smarthealth.notification.dto.PrescriptionEventDto;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class NotificationTemplateService {

    // --- Appointment Templates ---

    public String buildAppointmentSubject(String topic, AppointmentEventDto event) {
        if ("appointment-status-changed".equals(topic) && "CANCELLED".equalsIgnoreCase(event.getStatus())) {
            return "Appointment Cancelled – Smart Healthcare";
        }
        return switch (topic) {
            case "appointment-created" -> "Appointment Confirmed - Smart Healthcare";
            case "appointment-rescheduled" -> "Appointment Rescheduled - Smart Healthcare";
            case "appointment-status-changed" -> "Appointment Status Updated";
            case "appointment-reminder" -> "Reminder: Upcoming Appointment";
            default -> "Notification from Smart Healthcare";
        };
    }

    public String buildDoctorAppointmentSubject(String eventType) {
        return switch (eventType) {
            case "appointment-created" -> "New Appointment Booked - Smart Healthcare";
            case "appointment-status-changed" -> "Appointment Status Updated - Smart Healthcare";
            default -> "Notification from Smart Healthcare";
        };
    }

    public String buildAppointmentEmailBody(AppointmentEventDto event) {
        String greeting = "Dear " + (event.getPatientName() != null ? event.getPatientName() : "Patient") + ",\n\n";
        String footer = "\n\nRegards,\nSmart Healthcare Team";

        return switch (event.getEventType()) {
            case "APPOINTMENT_CREATED" -> greeting + 
                "Your appointment with Dr. " + event.getDoctorName() + " has been successfully booked.\n" +
                "Date: " + event.getAppointmentDate() + "\n" +
                "Time: " + event.getAppointmentTime() + footer;
            case "APPOINTMENT_RESCHEDULED" -> greeting +
                "Your appointment with Dr. " + event.getDoctorName() + " has been rescheduled.\n" +
                "New Date: " + event.getAppointmentDate() + "\n" +
                "New Time: " + event.getAppointmentTime() + footer;
            case "APPOINTMENT_CANCELLED" -> greeting +
                "Your appointment with Dr. " + event.getDoctorName() +
                " scheduled for " + event.getAppointmentDate() + " at " + event.getAppointmentTime() +
                " has been cancelled.\n\n" +
                "Appointment Details:\n" +
                "- Doctor: Dr. " + event.getDoctorName() + "\n" +
                "- Date: " + event.getAppointmentDate() + "\n" +
                "- Time: " + event.getAppointmentTime() + "\n\n" +
                "Please log in to the platform to rebook your appointment at your earliest convenience.\n" +
                footer;
            case "APPOINTMENT_STATUS_CHANGED" -> {
                if ("CANCELLED".equals(event.getStatus())) {
                    yield greeting + "Your appointment with Dr. " + event.getDoctorName() + " scheduled for " + event.getAppointmentDate() + " has been cancelled." + footer;
                } else if ("COMPLETED".equals(event.getStatus())) {
                    yield greeting + "Your appointment with Dr. " + event.getDoctorName() + " on " + event.getAppointmentDate() + " has been marked as completed." + footer;
                } else {
                    yield greeting + "There is an update regarding your appointment with Dr. " + event.getDoctorName() + ". New Status: " + event.getStatus() + footer;
                }
            }
            default -> greeting + "There is an update regarding your appointment with Dr. " + event.getDoctorName() + "." + footer;
        };
    }

    public String buildDoctorAppointmentEmailBody(AppointmentEventDto event) {
        String greeting = "Dear Dr. " + (event.getDoctorName() != null ? event.getDoctorName() : "Doctor") + ",\n\n";
        String footer = "\n\nRegards,\nSmart Healthcare Team";

        return switch (event.getEventType()) {
            case "APPOINTMENT_CREATED" -> greeting +
                "A new appointment has been booked with you.\n" +
                "Patient: " + event.getPatientName() + "\n" +
                "Date: " + event.getAppointmentDate() + "\n" +
                "Time: " + event.getAppointmentTime() + footer;
            case "APPOINTMENT_STATUS_CHANGED" -> {
                if ("CANCELLED".equals(event.getStatus())) {
                    yield greeting + "The appointment with patient " + event.getPatientName() + " scheduled for " + event.getAppointmentDate() + " at " + event.getAppointmentTime() + " has been cancelled." + footer;
                } else if ("COMPLETED".equals(event.getStatus())) {
                    yield greeting + "The appointment with patient " + event.getPatientName() + " on " + event.getAppointmentDate() + " has been marked as completed." + footer;
                } else {
                    yield greeting + "There is an update regarding your appointment with patient " + event.getPatientName() + ". New Status: " + event.getStatus() + footer;
                }
            }
            case "APPOINTMENT_CANCELLED" -> greeting +
                "The appointment with patient " + event.getPatientName() + " scheduled for " + event.getAppointmentDate() + " has been cancelled." + footer;
            default -> greeting + "There is an update regarding your appointment with patient " + event.getPatientName() + "." + footer;
        };
    }

    public String buildAppointmentSmsBody(AppointmentEventDto event) {
        return switch (event.getEventType()) {
            case "APPOINTMENT_CREATED" -> "Hi, your appointment with Dr. " + event.getDoctorName() + " is confirmed on " + event.getAppointmentDate() + " at " + event.getAppointmentTime() + ".";
            case "APPOINTMENT_RESCHEDULED" -> "Appointment Rescheduled: Dr. " + event.getDoctorName() + " on " + event.getAppointmentDate() + " at " + event.getAppointmentTime() + ".";
            case "APPOINTMENT_CANCELLED" -> "Appointment with Dr. " + event.getDoctorName() + " on " + event.getAppointmentDate() + " has been cancelled.";
            case "APPOINTMENT_STATUS_CHANGED" -> {
                if ("CANCELLED".equals(event.getStatus())) {
                    yield "Appointment with Dr. " + event.getDoctorName() + " on " + event.getAppointmentDate() + " has been cancelled.";
                } else if ("COMPLETED".equals(event.getStatus())) {
                    yield "Appointment with Dr. " + event.getDoctorName() + " on " + event.getAppointmentDate() + " is completed.";
                } else {
                    yield "Update on your appointment with Dr. " + event.getDoctorName() + ". New Status: " + event.getStatus();
                }
            }
            default -> "Update on your appointment with Dr. " + event.getDoctorName() + ". Check portal for details.";
        };
    }

    public String buildDoctorAppointmentSmsBody(AppointmentEventDto event) {
        return switch (event.getEventType()) {
            case "APPOINTMENT_CREATED" -> "New appointment booked: Patient " + event.getPatientName() + " on " + event.getAppointmentDate() + " at " + event.getAppointmentTime() + ".";
            case "APPOINTMENT_CANCELLED" -> "Appointment cancelled: Patient " + event.getPatientName() + " on " + event.getAppointmentDate() + ".";
            case "APPOINTMENT_STATUS_CHANGED" -> {
                if ("CANCELLED".equals(event.getStatus())) {
                    yield "Appointment cancelled: Patient " + event.getPatientName() + " on " + event.getAppointmentDate() + " at " + event.getAppointmentTime() + ".";
                } else if ("COMPLETED".equals(event.getStatus())) {
                    yield "Appointment completed: Patient " + event.getPatientName() + " on " + event.getAppointmentDate() + ".";
                } else {
                    yield "Update on appointment with " + event.getPatientName() + ". Status: " + event.getStatus();
                }
            }
            default -> "Update on appointment with " + event.getPatientName() + ".";
        };
    }

    // --- Prescription Templates ---

    public String buildPrescriptionSubject(String eventType) {
        return eventType.equals("prescription-created") ? "New Prescription Ready" : "Prescription Updated";
    }

    public String buildPrescriptionEmailBody(PrescriptionEventDto event) {
        String greeting = "Dear " + (event.getPatientName() != null ? event.getPatientName() : "Patient") + ",\n\n";
        String footer = "\n\nThank you,\nSmart Healthcare Team";

        return greeting + "Dr. " + event.getDoctorName() + " has " + 
            (event.getEventType().equals("PRESCRIPTION_CREATED") ? "issued a new" : "updated your") + 
            " prescription.\nSummary: " + event.getMedicationSummary() + "\nLog in to view details." + footer;
    }

    public String buildPrescriptionSmsBody(PrescriptionEventDto event) {
        return "Prescription " + (event.getEventType().equals("PRESCRIPTION_CREATED") ? "ready" : "updated") + 
            " from Dr. " + event.getDoctorName() + ". Summary: " + event.getMedicationSummary();
    }

    // --- Payment Templates ---

    public String buildPaymentSubject(String eventType) {
        return eventType.equals("payment-success") ? "Payment Successful - Booking Confirmed" : "Action Required: Payment Failed";
    }

    public String buildPaymentEmailBody(PaymentEventDto event) {
        String greeting = "Dear " + event.getPatientName() + ",\n\n";
        String footer = "\n\nRegards,\nSmart Healthcare Team";

        if ("SUCCESS".equals(event.getStatus())) {
            return greeting + "Your payment of " + event.getAmount() + " " + event.getCurrency() + " was successful.\n" +
                "Booking for Dr. " + event.getDoctorName() + " on " + event.getAppointmentDate() + " is confirmed.\n" +
                "Transaction ID: " + event.getTransactionId() + footer;
        } else {
            return greeting + "Your payment of " + event.getAmount() + " " + event.getCurrency() + " failed.\n" +
                "Appointment with Dr. " + event.getDoctorName() + " on " + event.getAppointmentDate() + " is NOT confirmed.\n" +
                "Please retry payment via the portal." + footer;
        }
    }

    public String buildPaymentReceiptBody(PaymentEventDto event) {
        return "--- PAYMENT RECEIPT ---\n\n" +
            "Transaction ID: " + event.getTransactionId() + "\n" +
            "Patient: " + event.getPatientName() + "\n" +
            "Doctor: Dr. " + event.getDoctorName() + "\n" +
            "Date: " + event.getAppointmentDate() + "\n" +
            "Amount: " + event.getAmount() + " " + event.getCurrency() + "\n" +
            "Status: COMPLETED\n\n" +
            "Thank you for your payment.";
    }

    public String buildPaymentSmsBody(PaymentEventDto event) {
        if ("SUCCESS".equals(event.getStatus())) {
            return "Confirmed! Payment of " + event.getAmount() + " successful for Dr. " + event.getDoctorName() + " on " + event.getAppointmentDate() + ".";
        } else {
            return "Payment FAILED for Dr. " + event.getDoctorName() + " on " + event.getAppointmentDate() + ". Please retry.";
        }
    }

    // --- New async notification templates ---

    public String appointmentBookedEmailSubject(AppointmentNotificationEvent e) {
        return "Appointment Booked Successfully - Smart Healthcare";
    }

    public String appointmentBookedEmailBody(AppointmentNotificationEvent e) {
        return "Dear " + safe(e.getPatientName(), "Patient") + ",\n\n"
                + "Your appointment has been booked successfully.\n"
                + "Doctor: Dr. " + safe(e.getDoctorName(), "N/A") + " (" + safe(e.getSpecialty(), "General") + ")\n"
                + "Date & Time: " + safe(e.getAppointmentDateTime(), "N/A") + "\n"
                + "Mode: " + safe(e.getMode(), "N/A") + "\n"
                + "Appointment ID: " + safe(e.getAppointmentId(), "N/A") + "\n\n"
                + "Regards,\nSmart Healthcare Team";
    }

    public String appointmentBookedSms(AppointmentNotificationEvent e) {
        return truncate160("Booked: Dr." + safe(e.getDoctorName(), "N/A")
                + " " + safe(e.getAppointmentDateTime(), "N/A")
                + " (" + safe(e.getMode(), "N/A") + "). ID " + safe(e.getAppointmentId(), ""));
    }

    public String appointmentCancelledEmailSubject(AppointmentNotificationEvent e) {
        return "Appointment Cancelled - Smart Healthcare";
    }

    public String appointmentCancelledEmailBody(AppointmentNotificationEvent e) {
        return "Dear " + safe(e.getPatientName(), "Patient") + ",\n\n"
                + "Your appointment has been cancelled.\n"
                + "Doctor: Dr. " + safe(e.getDoctorName(), "N/A") + " (" + safe(e.getSpecialty(), "General") + ")\n"
                + "Date & Time: " + safe(e.getAppointmentDateTime(), "N/A") + "\n"
                + "Mode: " + safe(e.getMode(), "N/A") + "\n"
                + "Appointment ID: " + safe(e.getAppointmentId(), "N/A") + "\n\n"
                + "Regards,\nSmart Healthcare Team";
    }

    public String appointmentCancelledSms(AppointmentNotificationEvent e) {
        return truncate160("Cancelled: Dr." + safe(e.getDoctorName(), "N/A")
                + " " + safe(e.getAppointmentDateTime(), "N/A")
                + ". ID " + safe(e.getAppointmentId(), ""));
    }

    public String prescriptionCreatedEmailSubject(PrescriptionNotificationEvent e) {
        return "Prescription Created for Your Patient - Smart Healthcare";
    }

    public String prescriptionCreatedEmailBody(PrescriptionNotificationEvent e) {
        return "Dear Dr. " + safe(e.getDoctorName(), "Doctor") + ",\n\n"
                + "A prescription has been created for patient: " + safe(e.getPatientName(), "N/A") + ".\n"
                + "Prescription ID: " + safe(e.getPrescriptionId(), "N/A") + "\n"
                + "Issued Date: " + safe(e.getIssuedDate(), "N/A") + "\n\n"
                + "Regards,\nSmart Healthcare Team";
    }

    public String prescriptionCreatedSms(PrescriptionNotificationEvent e) {
        return truncate160("Prescription created for " + safe(e.getPatientName(), "patient")
                + ". ID " + safe(e.getPrescriptionId(), "N/A")
                + ". " + safe(e.getIssuedDate(), ""));
    }

    private String safe(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value;
    }

    private String truncate160(String value) {
        if (value == null) return "";
        return value.length() <= 160 ? value : value.substring(0, 157) + "...";
    }
}