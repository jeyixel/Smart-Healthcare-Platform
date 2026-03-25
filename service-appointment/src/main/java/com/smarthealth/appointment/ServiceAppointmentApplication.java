package com.smarthealth.appointment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ServiceAppointmentApplication {

	public static void main(String[] args) {
		System.out.println("Service Appointment Application is starting...");
        SpringApplication.run(ServiceAppointmentApplication.class, args);
	}

}
