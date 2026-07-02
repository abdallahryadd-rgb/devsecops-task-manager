output "project_handoff" {
  description = "Terraform handoff values for k3s, Helm, ArgoCD, and testing stages."
  value       = terraform_data.k3s_target_validation.output
}

output "server_ip" {
  description = "Existing Linux server or VM IP address that will host k3s."
  value       = var.server_ip
}

output "app_namespace" {
  description = "Kubernetes namespace planned for the application."
  value       = var.app_namespace
}

output "frontend_url" {
  description = "Expected frontend URL for validation and testing."
  value       = local.frontend_url
}

output "backend_url" {
  description = "Expected backend API URL for validation and testing."
  value       = local.backend_url
}

output "frontend_image" {
  description = "Frontend Docker image reference to deploy with Helm or ArgoCD."
  value       = local.frontend_image
}

output "backend_image" {
  description = "Backend Docker image reference to deploy with Helm or ArgoCD."
  value       = local.backend_image
}
