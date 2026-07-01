# Kubernetes & GitOps Deployment - Secure Task Manager

This folder contains the complete infrastructure code, configuration, and orchestration manifests for deploying the **Secure Task Manager** application using **K3s**, **Helm**, and **ArgoCD**. This satisfies the Kubernetes & GitOps responsibilities for the project.

---

## Architecture Overview
```
+-------------------------------------------------------+
|                    Git Repository                     |
|           (Helm Chart & Application Code)             |
+--------------------------+----------------------------+
                           |
                           | GitOps Sync
                           v
+--------------------------+----------------------------+
|                        ArgoCD                         |
|  (Watches Git repo and syncs manifests to Kubernetes)  |
+--------------------------+----------------------------+
                           |
                           | Deploys
                           v
+-------------------------------------------------------+
|                     K3s Cluster                       |
|   +-----------------------------------------------+   |
|   |                  Namespaces                   |   |
|   |                                               |   |
|   |  [argocd]                                     |   |
|   |  - ArgoCD Controller, Server, Redis, Repo     |   |
|   |                                               |   |
|   |  [default]                                    |   |
|   |  - Secure Task Manager Pods (ReplicaSet)      |   |
|   |  - Service (ClusterIP)                        |   |
|   |  - Ingress (Traefik Class)                    |   |
|   +-----------------------------------------------+   |
+-------------------------------------------------------+
```

---

## Directory Structure
```
secure-task-manager/
├── argocd/
│   └── application.yaml       # ArgoCD GitOps Application CRD
├── helm/
│   └── secure-task-manager/
│       ├── Chart.yaml         # Helm chart metadata
│       ├── values.yaml        # Configurations (Replica count, image, probes, limits)
│       └── templates/         # Kubernetes resource templates
│           ├── _helpers.tpl   # Name and label helper templates
│           ├── deployment.yaml
│           ├── ingress.yaml
│           ├── service.yaml
│           └── serviceaccount.yaml
├── scripts/
│   ├── install-k3s.sh         # Automates installing K3s on Linux/WSL2
│   └── install-argocd.sh      # Automates installing ArgoCD on the cluster
└── README.md                  # This setup and deployment guide
```

---

## Step-by-Step Deployment Guide

### Step 1: Install K3s (Kubernetes Cluster)
K3s runs on Linux (including Windows WSL2 Ubuntu).
1. Make the script executable:
   ```bash
   chmod +x scripts/install-k3s.sh
   ```
2. Run the script with sudo permissions:
   ```bash
   sudo ./scripts/install-k3s.sh
   ```
3. Verify that the node is running:
   ```bash
   kubectl get nodes
   ```

### Step 2: Install ArgoCD
Deploy ArgoCD server into the K3s cluster:
1. Make the script executable:
   ```bash
   chmod +x scripts/install-argocd.sh
   ```
2. Run the script:
   ```bash
   ./scripts/install-argocd.sh
   ```
3. Retrieve the ArgoCD admin password:
   ```bash
   kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 --decode; echo
   ```
4. Access the dashboard:
   - Run the port-forward command in a background shell:
     ```bash
     kubectl port-forward svc/argocd-server -n argocd 8080:443
     ```
   - Open your browser to `https://localhost:8080` and log in with username `admin` and the password retrieved above.

### Step 3: Deploy the Application using GitOps (ArgoCD)
1. Fork or push this repository to your GitHub/GitLab account.
2. Edit [argocd/application.yaml](argocd/application.yaml) and update the `repoURL` to match your repository URL:
   ```yaml
   spec:
     source:
       repoURL: 'https://github.com/<your-username>/secure-task-manager.git'
   ```
3. Apply the ArgoCD Application manifest to register the application:
   ```bash
   kubectl apply -f argocd/application.yaml
   ```
4. ArgoCD will automatically read the Helm chart from your repository, deploy it, and continuously sync any future changes to your Helm configuration automatically.

---

## Manual Verification & Inspection Commands

Use the following commands to check the status of your deployments:

- **Check Application Pods**:
  ```bash
  kubectl get pods -l app.kubernetes.io/name=secure-task-manager
  ```
- **Check Service status**:
  ```bash
  kubectl get svc -l app.kubernetes.io/name=secure-task-manager
  ```
- **Check Ingress routing**:
  ```bash
  kubectl get ingress -l app.kubernetes.io/name=secure-task-manager
  ```
- **View Pod Logs**:
  ```bash
  kubectl logs -l app.kubernetes.io/name=secure-task-manager -f
  ```
- **Check ArgoCD Application sync status**:
  ```bash
  kubectl get application -n argocd
  ```
