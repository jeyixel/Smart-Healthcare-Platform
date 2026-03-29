# service-admin

Admin microservice for Smart Healthcare Platform.

## Purpose
This service owns admin-facing APIs and forwards patient domain mutations to `service-patient`.

## Endpoints
- `PATCH /api/v1/admin/patients/{patientId}/status?active=true`
- `POST /api/v1/admin/prescription-snapshots`

## Configuration
- `ADMIN_DB_URL` (default: `jdbc:postgresql://localhost:5432/admin_db`)
- `ADMIN_DB_USERNAME` (default: `postgres`)
- `ADMIN_DB_PASSWORD` (default: `postgres`)
- `ADMIN_DB_DDL_AUTO` (default: `update`)
- `ADMIN_DB_SCHEMA` (default: `admin_schema`)
- `PATIENT_SERVICE_BASE_URL` (default: `http://localhost:8081`)
- `PATIENT_SERVICE_SET_STATUS_ENDPOINT` (default: `/api/v1/internal/patients/{patientId}/status`)
- `PATIENT_SERVICE_UPSERT_PRESCRIPTION_ENDPOINT` (default: `/api/v1/internal/prescription-snapshots`)

## Notes
Configure `PATIENT_SERVICE_*` endpoint values to match actual patient-service API paths.
Admin actions are persisted in the `admin_action_logs` table in the admin database.
