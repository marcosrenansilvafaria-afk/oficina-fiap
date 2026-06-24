output "cluster_name" {
  description = "Nome do cluster Kind criado"
  value       = kind_cluster.oficina.name
}

output "cluster_endpoint" {
  description = "Endpoint do API server do cluster"
  value       = kind_cluster.oficina.endpoint
}

output "kubeconfig_path" {
  description = "Caminho do kubeconfig gerado pelo Kind (padrao: ~/.kube/config)"
  value       = "~/.kube/config"
}

output "namespace" {
  description = "Namespace Kubernetes da aplicacao"
  value       = kubernetes_namespace.oficina.metadata[0].name
}

output "postgres_service_dns" {
  description = "DNS interno do PostgreSQL (usar como host na DATABASE_URL dentro do cluster)"
  value       = "postgres.${var.namespace}.svc.cluster.local"
}

output "postgres_secret_name" {
  description = "Nome do Secret com as credenciais do PostgreSQL"
  value       = kubernetes_secret.postgres_credentials.metadata[0].name
}

output "api_nodeport_url" {
  description = "URL para acessar a API via NodePort mapeado no host"
  value       = "http://localhost:3000"
}
