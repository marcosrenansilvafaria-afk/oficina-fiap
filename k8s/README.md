# Kubernetes — Oficina FIAP

## Estrutura dos manifestos

| Arquivo | Recurso K8s | Descrição |
|---------|-------------|-----------|
| `namespace.yaml` | Namespace | Isola todos os recursos no namespace `oficina` |
| `configmap.yaml` | ConfigMap | Variáveis não-sensíveis (PORT, NODE_ENV, DB host/port/name) |
| `secret.example.yaml` | Secret (exemplo) | Placeholders — nunca versionar valores reais |
| `migrate-job.yaml` | Job | Roda `prisma migrate deploy` antes do Deployment servir tráfego |
| `deployment.yaml` | Deployment | API NestJS, 2 réplicas iniciais, probes TCP, resources definidos |
| `service.yaml` | Service x2 | ClusterIP (interno) + NodePort 30080 (acesso externo via Kind) |
| `hpa.yaml` | HPA | Escala de 2 a 5 réplicas; alvo CPU 60% / memória 70% |
| `kustomization.yaml` | Kustomization | Agrega todos os manifestos para `kubectl apply -k` |

## Pré-requisitos

1. Cluster Kind provisionado via Terraform (`cd ../infra && terraform apply`).
2. Imagem `oficina-api:latest` carregada no cluster:
   ```bash
   docker build -t oficina-api:latest ..
   kind load docker-image oficina-api:latest --name oficina
   ```
3. Secret real criado (nunca use `secret.example.yaml` com dados reais em produção):
   ```bash
   kubectl create secret generic oficina-api-secrets \
     --namespace=oficina \
     --from-literal=DATABASE_URL="postgresql://oficina:<senha>@postgres.oficina.svc.cluster.local:5432/oficina_db" \
     --from-literal=JWT_SECRET="<sua-chave-jwt-segura>" \
     --from-literal=EXTERNAL_WEBHOOK_TOKEN="<token-externo>"
   ```

## Deploy

```bash
kubectl apply -k k8s/
```

## Verificação

```bash
# Pods (Job migrate deve concluir; API deve ter 2+ Running)
kubectl get pods -n oficina

# HPA (aguardar metrics-server popular as métricas ~1min)
kubectl get hpa -n oficina

# Secrets e ConfigMaps criados
kubectl get secret,configmap -n oficina

# Acessar a API (Kind mapeia NodePort 30080 → host porta 3000)
curl http://localhost:3000/docs
```

## Teste de carga (demo HPA para o vídeo)

```bash
# Em um terminal: observar o HPA em tempo real
kubectl get hpa -n oficina -w

# Em outro terminal: gerar carga na API
kubectl run -it --rm loadgen \
  --image=busybox \
  --namespace=oficina \
  -- /bin/sh -c "while true; do wget -q -O- http://oficina-api:3000/docs > /dev/null; done"
```

Aguarde 30–60s e observe `kubectl get hpa -w` mostrando réplicas subindo de 2 para até 5.

## Remover o deploy

```bash
kubectl delete -k k8s/
```
