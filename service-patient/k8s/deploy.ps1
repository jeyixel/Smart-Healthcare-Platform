$ErrorActionPreference = 'Stop'

Write-Host "Creating namespace smart-healthcare (if missing)..."
kubectl create namespace smart-healthcare --dry-run=client -o yaml | kubectl apply -f -

Write-Host "Applying Namespace manifest..."
kubectl apply -f k8s/namespace.yaml

Write-Host "Applying PostgreSQL backend..."
kubectl apply -f k8s/patient-postgres.yaml

Write-Host "Applying ConfigMap..."
kubectl apply -f k8s/patient-service-configmap.yaml

Write-Host "Applying Secret..."
kubectl apply -f k8s/patient-service-secret.yaml

Write-Host "Applying Deployment..."
kubectl apply -f k8s/patient-service-deployment.yaml

Write-Host "Applying Service..."
kubectl apply -f k8s/patient-service.yaml

Write-Host "Waiting for rollout..."
kubectl rollout status deployment/patient-service -n smart-healthcare

Write-Host "Done. Resources in smart-healthcare namespace:"
kubectl get all -n smart-healthcare
