# Supabase Configuration Guide for Smart Healthcare Platform

## Prerequisites
- Supabase account (free tier available)
- kubectl CLI installed locally
- Access to your Kubernetes cluster

## 1. Create Supabase Project

### Option A: Manual Setup (5 minutes)
1. Visit [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: `smart-healthcare-platform`
   - **Password**: Generate strong password (20+ chars, save it securely!)
   - **Region**: Choose closest to your data center
4. Click "Create new project" and wait for initialization

### Option B: Via Supabase CLI
```bash
npx supabase projects create --name "smart-healthcare-platform"
```

## 2. Retrieve Connection Credentials

After project initializes:

1. Go to **Settings** → **Database**
2. Copy these values:
   - **Host**: `db.xxxxx.supabase.co`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: *(the one you set during creation)*

## 3. Initialize Patient Schema

### In Supabase Dashboard:
1. Go to **SQL Editor** → Click "+" → New Query
2. Paste this SQL:

```sql
-- Create patient schema
CREATE SCHEMA IF NOT EXISTS patient_schema;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA patient_schema TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA patient_schema TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA patient_schema TO postgres;
```

3. Click "▶ Run"

## 4. Configure Local Development

### Step A: Create `.env.local` file in `service-patient/`

```bash
cd service-patient
cat > .env.local << 'EOF'
PATIENT_DB_URL=jdbc:postgresql://db.XXXXX.supabase.co:5432/postgres
PATIENT_DB_USERNAME=postgres
PATIENT_DB_PASSWORD=your-password-here
PATIENT_DB_DDL_AUTO=update
PATIENT_DB_SHOW_SQL=false
PATIENT_DB_SCHEMA=patient_schema
EOF
```

### Step B: Load Environment Variables

**Windows PowerShell:**
```powershell
Get-Content .env.local | ForEach-Object {
    if ($_ -like "PATIENT_*") {
        [Environment]::SetEnvironmentVariable($_.Split('=')[0], $_.Split('=')[1], 'Process')
    }
}
```

**Linux/Mac Bash:**
```bash
export $(cat .env.local | grep PATIENT_ | xargs)
```

### Step C: Run Patient Service Locally

```bash
./mvnw spring-boot:run
```

You should see:
```
Hibernate: create table patient_schema.patients (...)
Patient service started on port 8081
```

## 5. Kubernetes Deployment

### Step A: Create Kubernetes Secret

1. Edit `k8s/patient-service-secret.yaml`:
   - Replace `db.xxxxx.supabase.co` with your actual Supabase host
   - Replace `your-actual-password` with your Supabase password

2. Deploy secret to cluster:
```bash
kubectl apply -f k8s/patient-service-secret.yaml
```

3. Verify:
```bash
kubectl get secret patient-service-secret -n smart-healthcare
```

### Step B: Deploy Service

```bash
# Apply configmap
kubectl apply -f k8s/patient-service-configmap.yaml

# Apply service
kubectl apply -f k8s/patient-service.yaml

# Apply deployment
kubectl apply -f k8s/patient-service-deployment.yaml

# Check status
kubectl get all -n smart-healthcare -l app=patient-service
```

## 6. Test the Connection

### Local Test
```bash
curl http://localhost:8081/api/v1/patients
# Expected: [] (empty list, or 200 OK)
```

### K8s Test
```bash
# Port forward to local
kubectl port-forward svc/patient-service 8081:8081 -n smart-healthcare

# In another terminal
curl http://localhost:8081/api/v1/patients
```

## 7. Production Security Notes

⚠️ **Never commit passwords to git!**

### Best Practice:
1. Store `k8s/patient-service-secret.yaml` in **separate secure repo** or use:
   - [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)
   - [SOPS](https://github.com/mozilla/sops)
   - HashiCorp Vault
   - Azure Key Vault

2. Use CI/CD to inject secrets (GitHub Actions, GitLab CI, etc.)

3. Example GitHub Actions workflow included in root `.github/workflows/`

## 8. Monitoring & Diagnostics

### Check pod logs:
```bash
kubectl logs -f deployment/patient-service -n smart-healthcare
```

### Check Supabase logs:
1. Supabase Dashboard → **Logs**
2. Filter by duration and status

### Common Issues:

| Error | Solution |
|-------|----------|
| `Connection refused` | Check Supabase IP whitelist (usually open by default) |
| `Authentication failed` | Verify password is correct, no special chars escaped wrongly |
| `Schema does not exist` | Run the SQL schema creation query again |
| `SSL error` | Add `?sslmode=require` to JDBC URL |

## 9. Next Steps

- [ ] Repeat this process for other microservices (doctor, appointment, etc.)
- [ ] Set up database backups in Supabase (Settings → Backups)
- [ ] Configure connection pooling for production
- [ ] Set up monitoring dashboards
- [ ] Create disaster recovery plan

## References
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL JDBC](https://jdbc.postgresql.org/documentation/head/connect.html)
- [Spring Boot Database](https://spring.io/guides/gs/accessing-data-jpa/)
