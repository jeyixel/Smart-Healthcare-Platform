package com.smarthealth.admin.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "patient.service")
public class PatientServiceProperties {

    private String baseUrl;
    private Endpoints endpoints = new Endpoints();

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public Endpoints getEndpoints() {
        return endpoints;
    }

    public void setEndpoints(Endpoints endpoints) {
        this.endpoints = endpoints;
    }

    public static class Endpoints {
        private String setStatus;
        private String upsertPrescription;

        public String getSetStatus() {
            return setStatus;
        }

        public void setSetStatus(String setStatus) {
            this.setStatus = setStatus;
        }

        public String getUpsertPrescription() {
            return upsertPrescription;
        }

        public void setUpsertPrescription(String upsertPrescription) {
            this.upsertPrescription = upsertPrescription;
        }
    }
}
