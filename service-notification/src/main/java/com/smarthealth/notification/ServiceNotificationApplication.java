package com.smarthealth.notification;

import com.smarthealth.notification.repository.NotificationLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.retry.annotation.EnableRetry;

@SpringBootApplication
@EnableRetry
@Slf4j
public class ServiceNotificationApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServiceNotificationApplication.class, args);
	}

	@Bean
	CommandLineRunner cleanupJunkRecords(NotificationLogRepository repository) {
		return args -> {
			log.info("Starting maintenance: Cleaning up junk notification records...");
			try {
				repository.deleteBySentAtIsNull();
				repository.deleteEpochZeroRecords();
				log.info("Cleanup completed successfully.");
			} catch (Exception e) {
				log.error("Failed to cleanup junk records: {}", e.getMessage());
			}
		};
	}

}
