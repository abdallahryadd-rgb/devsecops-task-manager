# Terraform Infrastructure Handoff

This folder contains Abdullah Abbas's Terraform layer for the Secure Task Manager DevSecOps project.

Terraform targets an existing local or VM Linux server that will later run k3s. It does not create AWS, Azure, or other cloud resources. Its job is to define the demo infrastructure inputs, validate the target server through SSH during apply, and print handoff outputs for the k3s, Helm, ArgoCD, and testing stages.

## Files

- `versions.tf` sets the Terraform version requirement.
- `variables.tf` defines the environment, target server, ports, Docker images, and database settings.
- `main.tf` builds the handoff configuration and validates SSH access to the existing server.
- `outputs.tf` prints the values needed by the next pipeline stages.
- `terraform.tfvars.example` provides safe example values.

## Usage

Copy the example variables file and edit it with your local values:

```powershell
Copy-Item terraform.tfvars.example terraform.tfvars
```

Run Terraform:

```powershell
terraform init
terraform fmt -check
terraform validate
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

During `apply`, Terraform connects to the existing Linux server by SSH and runs a small validation command. If `ssh_private_key_path` is not set, Terraform uses your SSH agent or default SSH configuration.

## Handoff Outputs

After a successful apply, share these outputs with the Kubernetes, Helm, ArgoCD, and testing owners:

- `server_ip`
- `app_namespace`
- `frontend_image`
- `backend_image`
- `frontend_url`
- `backend_url`
- `project_handoff`

These values support the project flow:

```text
GitHub -> GitHub Actions -> Security Scans -> Docker -> Terraform -> k3s -> Helm -> ArgoCD -> Testing
```

## Security Notes

Do not commit real Terraform variable files, SSH keys, passwords, kubeconfig files, or Terraform state. This repository ignores local `.tfvars`, `.terraform/`, and state files by default.
