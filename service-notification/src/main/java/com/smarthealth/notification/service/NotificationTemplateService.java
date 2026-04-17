package com.smarthealth.notification.service;

import com.smarthealth.notification.dto.AppointmentEventDto;
import com.smarthealth.notification.dto.PaymentEventDto;
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
            default -> greeting + "There is an update regarding your appointment with Dr. " + event.getDoctorName() + "." + footer;
        };
    }

    public String buildAppointmentSmsBody(AppointmentEventDto event) {
        return switch (event.getEventType()) {
            case "APPOINTMENT_CREATED" -> "Hi, your appointment with Dr. " + event.getDoctorName() + " is confirmed on " + event.getAppointmentDate() + " at " + event.getAppointmentTime() + ".";
            case "APPOINTMENT_RESCHEDULED" -> "Appointment Rescheduled: Dr. " + event.getDoctorName() + " on " + event.getAppointmentDate() + " at " + event.getAppointmentTime() + ".";
            case "APPOINTMENT_CANCELLED" -> "Appointment with Dr. " + event.getDoctorName() + " on " + event.getAppointmentDate() + " has been cancelled.";
            default -> "Update on your appointment with Dr. " + event.getDoctorName() + ". Check portal for details.";
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
}
