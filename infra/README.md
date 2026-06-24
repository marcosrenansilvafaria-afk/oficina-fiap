# Infraestrutura — Oficina FIAP (Terraform + Kind)

## Recursos provisionados

| Recurso | Tipo | Descrição |
|---------|------|-----------|
| `kind_cluster.oficina` | Kind Cluster | 1 control-plane + 2 workers; porta 30080 do host mapeada para 3000 |
| `kubernetes_namespace.oficina` | Namespace | Isola todos os recursos da aplicação |
| `kubernetes_secret.postgres_credentials` | Secret | Credenciais do PostgreSQL (nunca em texto puro) |
| `kubernetes_persistent_volume_claim.postgres_pvc` | PVC | 1 GiB persistente para dados do Postgres |
| `kubernetes_deployment.postgres` | Deployment | `postgres:16-alpine`, 1 réplica |
| `kubernetes_service.postgres` | Service ClusterIP | DNS interno: `postgres.oficina.svc.cluster.local:5432` |
| `helm_release.metrics_server` | Helm Release | metrics-server no `kube-system` — habilita o HPA |

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) — para rodar os nós Kind
- [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation) `>= 0.22`
- [kubectl](https://kubernetes.io/docs/tasks/tools/) — para interagir com o cluster
- [Terraform](https://developer.hashicorp.com/terraform/install) `>= 1.6`
- [Helm](https://helm.sh/docs/intro/install/) `>= 3.14`

## Passo a passo

### 1. Configurar variáveis

```bash
cp terraform.tfvars.example terraform.tfvars
# edite terraform.tfvars e defina db_password seguro
```

### 2. Inicializar providers

```bash
terraform init
```

### 3. Revisar o plano

```bash
terraform plan
```

### 4. Aplicar (provisionar)

```bash
terraform apply
```

Aguarda ~2–3 min enquanto o Kind baixa a imagem do nó e o metrics-server inicializa.

### 5. Verificar o cluster

```bash
kubectl get nodes
kubectl get pods -A
terraform output
```

### 6. Destruir o ambiente

```bash
terraform destroy
```

## Outputs

| Output | Descrição |
|--------|-----------|
| `cluster_name` | Nome do cluster Kind |
| `cluster_endpoint` | Endpoint do API server |
| `kubeconfig_path` | Caminho do kubeconfig (padrão `~/.kube/config`) |
| `namespace` | Namespace da aplicação |
| `postgres_service_dns` | DNS interno do Postgres para a DATABASE_URL |
| `postgres_secret_name` | Nome do Secret das credenciais |
| `api_nodeport_url` | URL de acesso à API pelo host (`http://localhost:3000`) |

## Próximo passo — deploy da aplicação

Após `terraform apply`, aplique os manifestos Kubernetes da aplicação:

```bash
# Carregar a imagem local no cluster Kind
kind load docker-image oficina-api:latest --name oficina

# Criar Secret real com credenciais (nunca versionar o secret.yaml real)
kubectl create secret generic oficina-api-secrets \
  --namespace=oficina \
  --from-literal=DATABASE_URL="postgresql://oficina:<senha>@postgres.oficina.svc.cluster.local:5432/oficina_db" \
  --from-literal=JWT_SECRET="<sua-chave-jwt>"

# Aplicar todos os manifestos
kubectl apply -k ../k8s/
```

Acesse em `http://localhost:3000/docs`.
