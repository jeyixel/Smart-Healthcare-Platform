# Frontend Environment Setup & Connection Guide

## Overview
The Smart Healthcare Platform frontend is a Next.js application that connects to the backend through an **API Gateway** that routes all requests to the appropriate microservices:
- **API Gateway** (port 8080) - Routes requests to all backend services
  - Admin Service (8087)
  - Doctor Service (8082)
  - Appointment Service (8083)
  - Patient Service (8081)
  - Prescription Service (8088)
  - Notification Service (8086)

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Backend Services Running:**
   - API Gateway on `http://localhost:8080` (routes to all services)
   - Individual services on their respective ports (see above)
   - Kafka/Redpanda on `localhost:29092`

## Environment Configuration

### 1. Development Environment (`.env.local`)

The `.env.local` file should use the API Gateway:

```bash
NEXT_PUBLIC_API_GATEWAY_BASE=http://localhost:8080
```

**This is used automatically when running `npm run dev`.**

**Note:** The API Gateway automatically routes based on path patterns:
- `/api/v1/auth/**` → Auth Service (8087)
- `/api/v1/admin/**` → Admin Service (8087)
- `/api/v1/doctors/**` → Doctor Service (8082)
- `/api/v1/appointments/**` → Appointment Service (8083)
- `/api/v1/patients/**` → Patient Service (8081)
- `/api/v1/prescriptions/**` → Prescription Service (8088)
- `/api/notifications/**` → Notification Service (8086)

### 2. Production Environment (`.env.production`)

For production deployments, update `.env.production` with your API Gateway URL:

```bash
NEXT_PUBLIC_API_GATEWAY_BASE=https://api-gateway.yourdomain.com
```

**This is used when running `npm run build` and deploying.**

### 3. Environment Variables Reference

| Variable | Purpose | Default | Example |
|----------|---------|---------|---------|
| `NEXT_PUBLIC_API_GATEWAY_BASE` | API Gateway URL (routes to all services) | `http://localhost:8080` | `https://api-gateway.yourdomain.com` |

**Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser and should not contain sensitive secrets.

## API Gateway Architecture

The API Gateway simplifies the frontend by:
1. **Single Endpoint** - All API calls go through one URL
2. **Automatic Routing** - Requests are routed to correct services based on path
3. **Centralized Authentication** - JWT tokens are validated by the gateway
4. **Load Balancing** - Can be distributed across multiple instances
5. **Request/Response Logging** - Centralized logging of all API traffic

See `api-gateway/src/main/resources/application.properties` for routing configuration.

## Running the Frontend

### Development Mode

```bash
cd frontend-client
npm run dev
```

The frontend will start on `http://localhost:3000` with hot-reload enabled.

### Production Build

```bash
cd frontend-client
npm run build
npm start
```

This creates an optimized build in the `.next/` directory.

### Linting & Type Checking

```bash
npm run lint      # Run ESLint
npm run build     # Full TypeScript + Next.js compile
```

## Features & API Integration

### Admin Authentication
- **Register**: Create new admin account with email, password, first name, last name
- **Login**: Authenticate and receive JWT token
- **Endpoints Used:**
  - `POST /api/v1/auth/register` → Admin Service (8087)
  - `POST /api/v1/auth/login` → Admin Service (8087)

### Patient Management
- **View Patients**: List all patients from the patient service
- **Toggle Status**: Activate/deactivate patient accounts (requires admin auth)
- **Endpoints Used:**
  - `GET /api/v1/patients` → Patient Service (8081)
  - `PATCH /api/v1/internal/patients/{id}/status` → Patient Service (8081)

### Event Feed
- **Real-time Events**: View Kafka events consumed by the patient service
- **Event Types**: PATIENT_STATUS_UPDATED, PRESCRIPTION_SNAPSHOT_UPSERTED
- **Endpoints Used:**
  - `GET /api/v1/patient-events` → Patient Service (8081)

## CORS Configuration

Both backend services have been configured to accept requests from the frontend:

**Allowed Origins:**
- `http://localhost:3000`
- `http://localhost:3001` (for alternative dev ports)

**Allowed Methods:** GET, POST, PUT, PATCH, DELETE, OPTIONS

**Files Modified:**
- `service-admin/src/main/java/com/smarthealth/admin/config/SecurityConfig.java`
- `service-patient/src/main/java/com/smarthealth/patient/config/SecurityConfig.java`

## Troubleshooting

### 1. frontend refuses to connect to Admin Service (8087)
**Error:** `Failed to fetch from admin API`

**Solution:**
- Verify admin service is running: `lsof -i :8087` (Mac/Linux) or `netstat -ano | findstr :8087` (Windows)
- Check `.env.local` has correct `NEXT_PUBLIC_ADMIN_API_BASE`
- Ensure CORS is enabled on admin service

### 2. Frontend refuses to connect to Patient Service (8081)
**Error:** `Failed to fetch patients`

**Solution:**
- Verify patient service is running: `netstat -ano | findstr :8081`
- Check `.env.local` has correct `NEXT_PUBLIC_PATIENT_API_BASE`
- Ensure CORS is enabled on patient service
- Verify Kafka is running on `localhost:29092`

### 3. CORS error when calling backend APIs
**Error:** `Access to XMLHttpRequest ... blocked by CORS policy`

**Solution:**
- Confirm SecurityConfig changes are deployed to both services
- Rebuild both services: `mvn clean install` in each service directory
- Restart the backend services
- Clear browser cache and cookies

### 4. Auth token not persisting after page reload
**Current State:** Token is stored in React state only (session memory)

**Solution (Future Enhancement):** Store token in localStorage:
```typescript
// In page.tsx onLogin:
localStorage.setItem('adminToken', response.token);
// On page load:
const saved = localStorage.getItem('adminToken');
setToken(saved || '');
```

## API Response Formats

### Admin Service Responses
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "ADMIN",
  "message": "Login successful"
}
```

### Patient Service Responses
```json
[
  {
    "id": "6cb0e817-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "active": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Kafka Event Format
```json
{
  "patientId": "6cb0e817-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "adminId": "a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "eventType": "PATIENT_STATUS_UPDATED",
  "description": "Patient status changed to ACTIVE",
  "status": "COMPLETED",
  "timestamp": "2024-01-15T10:30:25Z"
}
```

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│            http://localhost:3000                             │
│  ┌────────────────┐  ┌───────────────┐  ┌────────────────┐   │
│  │  AdminAuth     │  │ PatientTable  │  │   EventFeed    │   │
│  │   Component    │  │  Component    │  │   Component    │   │
│  └────────────────┘  └───────────────┘  └────────────────┘   │
└──────────────────────────────────────────────────────────────┘
         │                    │                      │
         │                    │                      │
         └────────────────────┼──────────────────────┘
                              │
                ┌─────────────┴──────────────┐
                │                            │
                ▼                            ▼
      ┌──────────────────┐        ┌──────────────────┐
      │   Admin Service  │        │  Patient Service │
      │ http://8087      │        │ http://8081      │
      │                  │        │                  │
      │ • Auth           │        │ • Patients       │
      │ • Status Update  │        │ • Internal API   │
      │ • Kafka Producer │        │ • Kafka Consumer │
      │ • User Mgmt      │        │ • Event Feed     │
      └──────────────────┘        └──────────────────┘
                │                            │
                └────────────────┬───────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ Kafka/Redpanda  │
                        │  localhost:29092│
                        │                 │
                        │  patient-events │
                        │      topic      │
                        └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ PostgreSQL DBs  │
                        │                 │
                        │ • admin_db      │
                        │ • patient_db    │
                        └─────────────────┘
```

## Next Steps

1. **Verify Backend Services**
   ```bash
   # Check admin service
   curl http://localhost:8087/health
   
   # Check patient service
   curl http://localhost:8081/health
   ```

2. **Start Frontend**
   ```bash
   cd frontend-client
   npm install  # (if not already done)
   npm run dev
   ```

3. **Open Browser**
   ```
   http://localhost:3000
   ```

4. **Test the Flow**
   - Register as admin
   - Login
   - View patients
   - Toggle patient status (watch Kafka event appear in event feed)

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Spring Boot CORS Guide](https://spring.io/guides/gs/rest-service-cors/)
- [Kafka Consumer Groups](https://kafka.apache.org/documentation/#consumerconfigs)

---

**Created:** April 2024  
**Last Updated:** April 14, 2026  
**Environment:** Development & Production Ready
