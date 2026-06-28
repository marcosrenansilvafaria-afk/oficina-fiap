# Copie este arquivo para terraform.tfvars e ajuste os valores.
# NUNCA versione o terraform.tfvars com senhas reais.

cluster_name = "oficina"
node_image   = "kindest/node:v1.30.0"
namespace    = "oficina"

db_user     = "oficina"
db_password = "mrsfrif"
db_name     = "oficina_db"

api_replicas = 2

# Porta local: 3000 está em uso pelo Docker Desktop no Windows
host_port = 3000

# Registry local para Docker Desktop Kubernetes (imagens não ficam no namespace k8s.io do Kind)
image_registry    = "host.docker.internal:5000/"
image_pull_policy = "IfNotPresent"
