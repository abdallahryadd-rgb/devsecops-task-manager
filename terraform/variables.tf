variable "environment" {
  description = "Deployment environment name used in resource labels and handoff outputs."
  type        = string
  default     = "dev"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{1,20}$", var.environment))
    error_message = "Environment must start with a lowercase letter and contain only lowercase letters, numbers, and hyphens."
  }
}

variable "app_namespace" {
  description = "Kubernetes namespace planned for the Secure Task Manager application."
  type        = string
  default     = "secure-task-manager"

  validation {
    condition     = can(regex("^[a-z0-9]([-a-z0-9]*[a-z0-9])?$", var.app_namespace))
    error_message = "Namespace must be a valid Kubernetes DNS label."
  }
}

variable "server_ip" {
  description = "Existing Linux server or VM IP address that will host k3s."
  type        = string

  validation {
    condition     = can(cidrhost("${var.server_ip}/32", 0))
    error_message = "Server IP must be a valid IPv4 address."
  }
}

variable "ssh_user" {
  description = "SSH user for the existing k3s target server."
  type        = string
  default     = "ubuntu"

  validation {
    condition     = length(trimspace(var.ssh_user)) > 0
    error_message = "SSH user cannot be empty."
  }
}

variable "ssh_port" {
  description = "SSH port for the existing k3s target server."
  type        = number
  default     = 22

  validation {
    condition     = var.ssh_port > 0 && var.ssh_port <= 65535
    error_message = "SSH port must be between 1 and 65535."
  }
}

variable "ssh_private_key_path" {
  description = "Optional local path to an SSH private key. Leave null to use ssh-agent or default SSH behavior."
  type        = string
  default     = null
}

variable "dockerhub_username" {
  description = "Docker Hub username used by GitHub Actions when pushing application images."
  type        = string

  validation {
    condition     = can(regex("^[a-zA-Z0-9][a-zA-Z0-9_-]{1,38}$", var.dockerhub_username))
    error_message = "Docker Hub username must be 2-39 characters and use letters, numbers, underscores, or hyphens."
  }
}

variable "backend_image_name" {
  description = "Backend Docker image repository name."
  type        = string
  default     = "task-manager-backend"
}

variable "frontend_image_name" {
  description = "Frontend Docker image repository name."
  type        = string
  default     = "task-manager-frontend"
}

variable "image_tag" {
  description = "Docker image tag that Helm or ArgoCD should deploy."
  type        = string
  default     = "latest"
}

variable "frontend_port" {
  description = "Frontend service port."
  type        = number
  default     = 5173
}

variable "backend_port" {
  description = "Backend API service port."
  type        = number
  default     = 5000
}

variable "database_port" {
  description = "PostgreSQL service port."
  type        = number
  default     = 5432
}

variable "database_name" {
  description = "PostgreSQL database name used by the backend."
  type        = string
  default     = "task_manager"
}

variable "database_user" {
  description = "PostgreSQL user used by the backend."
  type        = string
  default     = "postgres"
}

variable "app_host" {
  description = "Optional hostname or IP used for expected application URLs. Defaults to server_ip."
  type        = string
  default     = null
}
