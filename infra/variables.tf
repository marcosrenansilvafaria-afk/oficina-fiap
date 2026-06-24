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
