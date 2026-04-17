# Patient Service on Kubernetes (Beginner Guide)

This folder contains everything needed to run `service-patient` on Kubernetes.

## 1) Prerequisites

- Install Docker Desktop.
- In Docker Desktop settings, enable `Kubernetes`.
- Install `kubectl` and make sure `kubectl version --client` works.

## 2) Build Docker image

From the `service-patient` folder:

```powershell
docker build -t patient-service:latest .
```

If you are using Minikube instead of Docker Desktop Kubernetes:

```powershell
minikube image load patient-service:latest
```

## 3) Configure database secret

Edit `k8s/patient-service-secret.yaml` and set:

- `PATIENT_DB_URL`
- `PATIENT_DB_USERNAME`
- `PATIENT_DB_PASSWORD`

## 4) Deploy to Kubernetes

From the `service-patient` folder:

```powershell
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/patient-postgres.yaml
kubectl apply -f k8s/patient-service-configmap.yaml
kubectl apply -f k8s/patient-service-secret.yaml
kubectl apply -f k8s/patient-service-deployment.yaml
kubectl apply -f k8s/patient-service.yaml
```

## 5) Verify deployment

```powershell
kubectl get pods -n smart-healthcare
kubectl get svc -n smart-healthcare
kubectl logs -n smart-healthcare deploy/patient-service
```

## 6) Access service locally

Use port-forward:

```powershell
kubectl port-forward -n smart-healthcare svc/patient-service 8081:8081
```

Then open:

- `http://localhost:8081/actuator/health`

## 7) Update after code changes

```powershell
docker build -t patient-service:latest .
kubectl rollout restart deployment/patient-service -n smart-healthcare
kubectl rollout status deployment/patient-service -n smart-healthcare
```
