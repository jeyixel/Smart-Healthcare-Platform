# ════════════════════════════════════════════════════════════════
# Smart Healthcare Platform — K8s Full Apply Script (PowerShell)
# ════════════════════════════════════════════════════════════════
# Run from project root: .\k8s\apply-all.ps1

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $PSScriptRoot

Write-Host "=== 1/6 Creating namespace ===" -ForegroundColor Cyan
kubectl apply -f "$ROOT\k8s\namespace.yaml"

Write-Host "=== 2/6 Applying centralized secret ===" -ForegroundColor Cyan
kubectl apply -f "$ROOT\k8s\smart-healthcare-secret.yaml"

Write-Host "=== 3/6 Deploying Kafka (Redpanda) ===" -ForegroundColor Cyan
kubectl apply -f "$ROOT\k8s\kafka.yaml"
Write-Host "Waiting for Kafka to be ready..."
kubectl wait --for=condition=available deployment/kafka -n smart-healthcare --timeout=120s

Write-Host "=== 4/6 Deploying databases ===" -ForegroundColor Cyan
kubectl apply -f "$ROOT\service-patient\k8s\patient-postgres.yaml"

Write-Host "=== 5/6 Deploying backend services ===" -ForegroundColor Cyan
# ConfigMaps first
kubectl apply -f "$ROOT\service-admin\k8s\admin-service-configmap.yaml"
kubectl apply -f "$ROOT\service-patient\k8s\patient-service-configmap.yaml"
kubectl apply -f "$ROOT\service-doctor\k8s\doctor-configmap.yaml"
kubectl apply -f "$ROOT\service-appointment\k8s\appoinment-configmap.yaml"
kubectl apply -f "$ROOT\service-prescription\k8s\prescription-configmap.yaml"
kubectl apply -f "$ROOT\service-telemedicine\k8s\telemedicine-configmap.yaml"

# Deployments + Services
kubectl apply -f "$ROOT\service-admin\k8s\admin-service-deployment.yaml"
kubectl apply -f "$ROOT\service-admin\k8s\admin-service.yaml"
kubectl apply -f "$ROOT\service-patient\k8s\patient-service-deployment.yaml"
kubectl apply -f "$ROOT\service-patient\k8s\patient-service.yaml"
kubectl apply -f "$ROOT\service-doctor\k8s\doctor-deployment.yaml"
kubectl apply -f "$ROOT\service-doctor\k8s\doctor-service.yaml"
kubectl apply -f "$ROOT\service-appointment\k8s\appoinment-deployment.yaml"
kubectl apply -f "$ROOT\service-appointment\k8s\appoinment-service.yaml"
kubectl apply -f "$ROOT\service-payment\k8s\payment-service-deployment.yaml"
kubectl apply -f "$ROOT\service-prescription\k8s\prescription-deployment.yaml"
kubectl apply -f "$ROOT\service-prescription\k8s\prescription-service.yaml"
kubectl apply -f "$ROOT\service-telemedicine\k8s\telemedicine-deployment.yaml"
kubectl apply -f "$ROOT\service-telemedicine\k8s\telemedicine-service.yaml"
kubectl apply -f "$ROOT\service-notification\k8s\notification-service-deployment.yaml"

Write-Host "=== 6/6 Deploying API Gateway + Frontend (NodePort) ===" -ForegroundColor Cyan
kubectl apply -f "$ROOT\api-gateway\k8s\api-gateway-deployment.yaml"
kubectl apply -f "$ROOT\frontend-client\k8s\frontend-deployment.yaml"

Write-Host ""
Write-Host "=== Deployment complete! ===" -ForegroundColor Green
Write-Host "API Gateway: http://localhost:30080" -ForegroundColor Yellow
Write-Host "Frontend:    http://localhost:30000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Check status: kubectl get pods -n smart-healthcare"
