variable "cluster_name" {
  description = "Nome do cluster Kind"
  type        = string
  default     = "oficina"
}

variable "node_image" {
  description = "Imagem do node Kind (deve ser compativel com a versao do Kind instalada)"
  type        = string
  default     = "kindest/node:v1.30.0"
}

variable "namespace" {
  description = "Namespace Kubernetes da aplicacao"
  type        = string
  default     = "oficina"
}

variable "db_user" {
  description = "Usuario do PostgreSQL"
  type        = string
  default     = "oficina"
}

variable "db_password" {
  description = "Senha do PostgreSQL"
  type        = string
  sensitive   = true
  default     = "oficina123"
}

variable "db_name" {
  description = "Nome do banco de dados"
  type        = string
  default     = "oficina_db"
}

variable "api_replicas" {
  description = "Numero inicial de replicas da API (o HPA ajusta automaticamente)"
  type        = number
  default     = 2
}

variable "jwt_secret" {
  description = "Chave secreta para assinar tokens JWT da API"
  type        = string
  sensitive   = true
  default     = "dev-jwt-secret-troque-em-producao"
}

variable "external_webhook_token" {
  description = "Token de autenticacao para o webhook externo de aprovacao de orcamento"
  type        = string
  sensitive   = true
  default     = "dev-webhook-token-troque-em-producao"
}

variable "image_tag" {
  description = "Tag da imagem Docker da API (padrao: latest; em CI usa o SHA curto do commit)"
  type        = string
  default     = "latest"
}
