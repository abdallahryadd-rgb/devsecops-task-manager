locals {
  app_host = coalesce(var.app_host, var.server_ip)

  frontend_image = "${var.dockerhub_username}/${var.frontend_image_name}:${var.image_tag}"
  backend_image  = "${var.dockerhub_username}/${var.backend_image_name}:${var.image_tag}"

  frontend_url = "http://${local.app_host}:${var.frontend_port}"
  backend_url  = "http://${local.app_host}:${var.backend_port}/api"

  common_labels = {
    project     = "secure-task-manager"
    environment = var.environment
    managed_by  = "terraform"
    owner       = "abdullah-abbas"
  }

  handoff = {
    architecture   = "GitHub -> GitHub Actions -> Security Scans -> Docker -> Terraform -> k3s -> Helm -> ArgoCD -> Testing"
    server_ip      = var.server_ip
    ssh_user       = var.ssh_user
    ssh_port       = var.ssh_port
    namespace      = var.app_namespace
    frontend_url   = local.frontend_url
    backend_url    = local.backend_url
    frontend_port  = var.frontend_port
    backend_port   = var.backend_port
    database_port  = var.database_port
    database_name  = var.database_name
    database_user  = var.database_user
    frontend_image = local.frontend_image
    backend_image  = local.backend_image
  }
}

resource "terraform_data" "k3s_target_validation" {
  input = local.handoff

  connection {
    type        = "ssh"
    host        = var.server_ip
    user        = var.ssh_user
    port        = var.ssh_port
    private_key = var.ssh_private_key_path == null ? null : file(var.ssh_private_key_path)
    agent       = var.ssh_private_key_path == null
    timeout     = "30s"
  }

  provisioner "remote-exec" {
    inline = [
      "uname -s",
      "command -v sh",
      "echo Terraform target validation completed for ${var.environment}"
    ]
  }
}
