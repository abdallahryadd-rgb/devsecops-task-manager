#!/bin/bash
# install-k3s.sh
# Automates the installation of K3s (Lightweight Kubernetes) for Mahmoud Rizk's part.

set -e

echo "===================================================="
echo "Starting K3s Installation..."
echo "===================================================="

# Check if running as root or via sudo
if [ "$EUID" -ne 0 ]; then
  echo "[WARNING] This script should typically run with sudo privileges."
  echo "Example: sudo bash install-k3s.sh"
  echo "----------------------------------------------------"
fi

# Install K3s (disabling default traefik to allow custom ingress controllers if needed, or keep standard)
# We will install standard k3s.
echo "[1/3] Downloading and installing K3s..."
curl -sfL https://get.k3s.io | sh -

# Setup kubeconfig access for non-root user if running via sudo/root
echo "[2/3] Configuring kubeconfig access..."
if [ -n "$SUDO_USER" ]; then
  USER_HOME=$(eval echo "~$SUDO_USER")
  mkdir -p "$USER_HOME/.kube"
  cp /etc/rancher/k3s/k3s.yaml "$USER_HOME/.kube/config"
  chown -R "$SUDO_USER:$SUDO_USER" "$USER_HOME/.kube"
  chmod 600 "$USER_HOME/.kube/config"
  echo "Kubeconfig configured for user: $SUDO_USER"
else
  mkdir -p "$HOME/.kube"
  cp /etc/rancher/k3s/k3s.yaml "$HOME/.kube/config"
  chmod 600 "$HOME/.kube/config"
  echo "Kubeconfig configured for current user."
fi

# Verify cluster status
echo "[3/3] Verifying cluster status..."
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
kubectl get nodes

echo "===================================================="
echo "K3s installation completed successfully!"
echo "You can now run: kubectl get nodes"
echo "===================================================="
