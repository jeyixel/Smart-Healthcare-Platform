# Smart Healthcare Platform - Supabase Database Architecture

## Overview
Each microservice has its own separate PostgreSQL schema within a single Supabase project.  
This follows the **Database-per-Service** microservices pattern.

## Supabase Project Structure

```
Supabase Project: smart-healthcare-platform
├── patient_schema
│   └── tables: patients, medical_history, allergies, etc.
├── doctor_schema
│   └── tables: doctors, specializations, availability, etc.
├── appointment_schema
│   └── tables: appointments, schedules, cancellations, etc.
├── payment_schema
│   └── tables: payments, invoices, transactions, etc.
├── telemedicine_schema
│   └── tables: consultations, video_sessions, recordings, etc.
└── notification_schema
    └── tables: notifications, email_queue, sms_queue, etc.
```

## Environment Variable Convention

Each microservice uses a consistent naming pattern:

```
{SERVICE}_DB_URL=jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres
{SERVICE}_DB_USERNAME=postgres
{SERVICE}_DB_PASSWORD=<same-for-all-services>
{SERVICE}_DB_SCHEMA=<service>_schema
{SERVICE}_DB_DDL_AUTO=update
{SERVICE}_DB_SHOW_SQL=false
```

### All Services Credentials

| Service | Schema | Env Prefix |
|---------|--------|-----------|
| Patient | `patient_schema` | `PATIENT_DB_*` |
| Doctor | `doctor_schema` | `DOCTOR_DB_*` |
| Appointment | `appointment_schema` | `APPOINTMENT_DB_*` |
| Payment | `payment_schema` | `PAYMENT_DB_*` |
| Telemedicine | `telemedicine_schema` | `TELEMEDICINE_DB_*` |
| Notification | `notification_schema` | `NOTIFICATION_DB_*` |

## PostgreSQL Schemas Creation Script

Run this once in Supabase SQL Editor after creating the project:

```sql
-- Create all service schemas
CREATE SCHEMA IF NOT EXISTS patient_schema;
CREATE SCHEMA IF NOT EXISTS doctor_schema;
CREATE SCHEMA IF NOT EXISTS appointment_schema;
CREATE SCHEMA IF NOT EXISTS payment_schema;
CREATE SCHEMA IF NOT EXISTS telemedicine_schema;
CREATE SCHEMA IF NOT EXISTS notification_schema;

-- Grant all permissions to postgres user
GRANT ALL PRIVILEGES ON SCHEMA patient_schema TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA doctor_schema TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA appointment_schema TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA payment_schema TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA telemedicine_schema TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA notification_schema TO postgres;

-- Grant default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA patient_schema GRANT ALL PRIVILEGES ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA doctor_schema GRANT ALL PRIVILEGES ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA appointment_schema GRANT ALL PRIVILEGES ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA payment_schema GRANT ALL PRIVILEGES ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA telemedicine_schema GRANT ALL PRIVILEGES ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA notification_schema GRANT ALL PRIVILEGES ON TABLES TO postgres;

-- Verify schemas created
SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE '%_schema';
```

## K8s Secrets for All Services

Create one secret per service, each containing the appropriate credentials:

```yaml
# patient-service-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: patient-service-secret
  namespace: smart-healthcare
stringData:
  PATIENT_DB_URL: "jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres"
  PATIENT_DB_USERNAME: "postgres"
  PATIENT_DB_PASSWORD: "<password>"
  PATIENT_DB_SCHEMA: "patient_schema"

---
# doctor-service-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: doctor-service-secret
  namespace: smart-healthcare
stringData:
  DOCTOR_DB_URL: "jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres"
  DOCTOR_DB_USERNAME: "postgres"
  DOCTOR_DB_PASSWORD: "<password>"
  DOCTOR_DB_SCHEMA: "doctor_schema"

# ... repeat for other services
```

## Application Properties Template for Services

Each service's `application.properties` should follow this pattern:

```properties
spring.application.name=service-patient
server.port=8081

# Database configuration (replace patient with respective service prefix)
spring.datasource.url=${PATIENT_DB_URL:jdbc:postgresql://localhost:5432/postgres}
spring.datasource.username=${PATIENT_DB_USERNAME:postgres}
spring.datasource.password=${PATIENT_DB_PASSWORD:postgres}
spring.jpa.hibernate.ddl-auto=${PATIENT_DB_DDL_AUTO:update}
spring.jpa.show-sql=${PATIENT_DB_SHOW_SQL:false}
spring.jpa.properties.hibernate.default_schema=${PATIENT_DB_SCHEMA:patient_schema}
spring.jpa.properties.hibernate.format_sql=true
```

## Kubernetes ConfigMap (Shared)

One shared ConfigMap for all services:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: database-config
  namespace: smart-healthcare
data:
  SPRING_PROFILES_ACTIVE: "prod"
  DB_DDL_AUTO: "update"
  DB_SHOW_SQL: "false"
  POSTGRES_HOST: "db.xxxxx.supabase.co"
  POSTGRES_PORT: "5432"
```

## Data Isolation & Security

✅ **Strengths of this architecture:**
- Complete data isolation per service (cannot access other schemas)
- Single point of backup (Supabase manages entire DB)
- Simplified credential management (one password for all)
- Easy schema versioning and migrations

⚠️ **Important notes:**
- Cross-service queries require inter-service API calls (not direct DB joins)
- Use service mesh (Istio) or API Gateway for routing
- Each service owns its schema (no direct schema modifications by other services)

## Connection Pooling Configuration

For production, add to each service's `application.properties`:

```properties
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=2
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=1200000
spring.datasource.hikari.connection-timeout=20000
```

## Backup & Disaster Recovery

**Supabase automatically handles:**
- Daily backups (retained 7 days on free tier)
- Point-in-time recovery (Enterprise plan)

**You should:**
- Test restore procedures monthly
- Document database rollback steps
- Have documented recovery RPO/RTO targets

## Next: API Gateway Configuration

After all microservices are connected to their respective Supabase schemas:
1. Configure API Gateway with routing rules
2. Set up inter-service authentication
3. Implement distributed tracing
4. Configure observability dashboards
