#!/bin/bash
# Deploy patient service secret to Kubernetes cluster

set -e

NAMESPACE="smart-healthcare"
SECRET_FILE="./k8s/patient-service-secret.yaml"

echo "Creating namespace if not exists..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

echo "Applying patient service secret..."
kubectl apply -f $SECRET_FILE

echo "Verifying secret exists..."
kubectl get secret patient-service-secret -n $NAMESPACE

echo "✓ Patient service secret deployed successfully!"
