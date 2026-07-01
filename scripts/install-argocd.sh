#!/bin/bash
# install-argocd.sh
# Installs ArgoCD inside the K3s cluster and prints instructions to access it.

set -e

echo "===================================================="
echo "Installing ArgoCD on K3s..."
echo "===================================================="

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
  echo "[ERROR] kubectl command not found. Please make sure K3s is installed and configured."
  exit 1
fi

# Create argocd namespace
echo "[1/3] Creating argocd namespace..."
kubectl create namespace argocd || echo "Namespace 'argocd' already exists."

# Apply ArgoCD official installation manifests
echo "[2/3] Applying ArgoCD official manifests..."
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD components to be ready
echo "Waiting for ArgoCD server components to be ready (this may take a minute)..."
kubectl rollout status deployment/argocd-server -n argocd --timeout=150s

echo "===================================================="
echo "ArgoCD installed successfully!"
echo "===================================================="
echo ""
echo "How to access ArgoCD dashboard:"
echo "1. Port forward the ArgoCD API Server:"
echo "   kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "   Then open: https://localhost:8080"
echo ""
echo "2. Retrieve the initial admin password:"
echo "   kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath=\"{.data.password}\" | base64 --decode; echo"
echo ""
echo "3. Log in with:"
echo "   Username: admin"
echo "   Password: [Output of the password retrieval command above]"
echo "===================================================="
