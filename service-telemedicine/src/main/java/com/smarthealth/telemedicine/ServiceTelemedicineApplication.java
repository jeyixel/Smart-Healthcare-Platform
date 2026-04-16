package com.smarthealth.telemedicine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// this will exclude the auto configuration of datasource and hibernate, since we are using a custom datasource configuration
@SpringBootApplication(excludeName = {
    "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration",
    "org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration",
    "org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration"
})
public class ServiceTelemedicineApplication {

	public static void main(String[] args) {
		System.out.println("Telemedicine service is starting");
		SpringApplication.run(ServiceTelemedicineApplication.class, args);
	}

}
