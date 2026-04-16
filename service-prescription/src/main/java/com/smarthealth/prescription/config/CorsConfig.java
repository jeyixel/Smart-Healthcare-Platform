package com.smarthealth.prescription.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow frontend origin
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        
        // Allow common HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        
        // Allow common headers
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", "Content-Type", "Accept", "Origin", 
            "Access-Control-Request-Method", "Access-Control-Request-Headers"
        ));
        
        // Allow credentials
        configuration.setAllowCredentials(true);
        
        // Set max age for pre-flight requests
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
