# Oficina FIAP - MVP Backend

[![CI/CD](https://github.com/marcosrenansilvafaria-afk/oficina-fiap/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/marcosrenansilvafaria-afk/oficina-fiap/actions/workflows/ci-cd.yml)

## Sumário

- [Objetivo](#objetivo)
- [Stack](#stack)
- [Como usar o `.env`](#como-usar-o-env)
- [Como executar localmente](#como-executar-localmente)
- [Deploy em Kubernetes](#deploy-em-kubernetes)
- [Provisionamento via Terraform](#provisionamento-via-terraform)
- [CI/CD (GitHub Actions)](#cicd-github-actions)
- [Testes e qualidade](#testes-e-qualidade)
- [Entregáveis](#entregáveis)

Backend do desafio de oficina mecânica com foco em fluxo de Ordem de Serviço (OS), autenticação JWT e entrega incremental baseada em DDD + Clean Architecture.

## Objetivo

Disponibilizar uma API simples e rastreável para:
- Criar e acompanhar Ordens de Serviço.
- Gerenciar clientes, veículos, peças e serviços.
- Simular envio de orçamento ao cliente.
- Garantir controle de acesso com JWT + RBAC.

## Stack

- Node.js 20+
- NestJS 11
- TypeScript
- Prisma 7 (ORM)
- PostgreSQL 16
- Swagger
- Docker / Docker Compose

## Como usar o `.env`

Crie o arquivo `.env` copiando o modelo `.env.example` para a raiz do projeto.

```bash
copy .env.example .env
```

Variáveis atuais:

- `DATABASE_URL`: string de conexão PostgreSQL. Exemplo: `postgresql://oficina:oficina@localhost:5432/oficina`.
- `DB_USER`, `DB_PASSWORD`, `DB_NAME`: usadas pelo serviço `postgres` no `docker-compose.yml`.
- `JWT_SECRET`: chave usada para assinar os tokens JWT. Use uma string longa, aleatória e diferente entre ambientes.
- `PORT`: porta em que a API sobe localmente. O padrão é `3000`.
- `SEED_DATA`: quando `true`, insere dados mínimos no banco (via repositórios Prisma) no startup.

Seed (quando `SEED_DATA=true`):

- Cliente: `cli-001`
- Veículo: `vei-001`
- Serviço: `srv-001`
- Peça: `pec-001`

Observações:

- O seed roda apenas no startup e não sobrescreve dados existentes (upsert por ID).
- Com Prisma, os dados persistem entre reinicializações da API.
- Se alterar `SEED_DATA`, reinicie a API.

Boas práticas:

- Nunca versionar `.env`.
- Em ambiente local, mantenha valores simples e previsíveis.
- Em produção, prefira secrets do ambiente/CI e rotacione a chave quando necessário.
- Se alterar `JWT_SECRET`, todos os tokens emitidos anteriormente deixam de ser válidos.

## Como executar localmente

### Sem Docker

1. Instale dependências:

```bash
npm install
```

2. Suba o banco de dados (requer Docker):

```bash
docker-compose up -d postgres
```

3. Gere o client Prisma e aplique as migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

4. Execute em modo desenvolvimento:

```bash
npm run start:dev
```

5. Acesse a API:
- http://localhost:3000

6. Acesse a documentação Swagger:
- http://localhost:3000/docs

Ordem recomendada para demo (fluxo da OS — Fase 2):

1. `POST /auth/login` (obter token JWT).
2. `POST /clientes`, `POST /veiculos`, `POST /servicos`, `POST /pecas`.
3. `POST /os`.
4. `POST /os/:id/diagnostico`.
5. `POST /os/:id/item`.
6. `POST /os/:id/orcamento` e `POST /os/:id/enviar-orcamento`.
7. `POST /os/:id/orcamento/webhook` com `{ "aprovado": true }` (ou `false` para recusar e rediagnosticar).
8. `GET /os/:id/status` (verificar status atual com label PT-BR).
9. `GET /os` (listagem ordenada por prioridade operacional).
10. `POST /os/:id/executar` e `POST /os/:id/finalizar`.
11. `GET /os/sla-atendimento`.
12. `POST /os/:id/entregar`.
13. `GET /os/:id`.

### Com Docker (API + Banco)

```bash
docker-compose up --build
```

API disponível em:
- http://localhost:3000

Obs.: na primeira execução, aplique as migrations manualmente se o serviço `api` subir antes do `postgres` estar saudável:

```bash
docker-compose exec api npx prisma migrate deploy
```

## Deploy em Kubernetes

### Pré-requisitos

- Docker, [Kind](https://kind.sigs.k8s.io), [kubectl](https://kubernetes.io/docs/tasks/tools/), [Terraform](https://developer.hashicorp.com/terraform/install) ≥ 1.6, [Helm](https://helm.sh) ≥ 3.14.

### 1. Provisionar infraestrutura (Terraform)

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars  # ajustar db_password
terraform init
terraform apply
```

Cria: cluster Kind (1 control-plane + 2 workers), namespace `oficina`, Postgres no cluster, metrics-server (necessário para o HPA).

### 2. Carregar imagem e criar Secret

```bash
# Voltar para a raiz do projeto
cd ..

docker build -t oficina-api:latest .
kind load docker-image oficina-api:latest --name oficina

kubectl create secret generic oficina-api-secrets \
  --namespace=oficina \
  --from-literal=DATABASE_URL="postgresql://oficina:<senha>@postgres.oficina.svc.cluster.local:5432/oficina_db" \
  --from-literal=JWT_SECRET="<sua-chave-jwt>"
```

### 3. Aplicar manifestos

```bash
kubectl apply -k k8s/
```

### 4. Verificar

```bash
kubectl get pods -n oficina        # 2 Pods API Running + Job migrate Completed
kubectl get hpa -n oficina         # min 2 / max 5 réplicas, alvo CPU 60%
kubectl get secret,configmap -n oficina
```

API acessível em `http://localhost:3000` (NodePort mapeado pelo Kind).

### 5. Destruir

```bash
cd infra && terraform destroy
```

## Provisionamento via Terraform

Ver guia completo em [infra/README.md](infra/README.md).

| Comando | Descrição |
|---------|-----------|
| `terraform init` | Baixa providers (kind, kubernetes, helm) |
| `terraform plan` | Mostra o que será criado |
| `terraform apply` | Provisiona cluster + banco + metrics-server |
| `terraform output` | Exibe DNS do Postgres, namespace, URL da API |
| `terraform destroy` | Destrói tudo (cluster + dados) |

## CI/CD (GitHub Actions)

Pipeline definido em [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml).

| Job | Gatilho | O que faz |
|-----|---------|-----------|
| `build-lint` | push/PR → main | `npm ci` → `prisma generate` → `nest build` → `lint` |
| `test` | após build-lint | testes unitários + e2e + **quality gate cobertura ≥ 80%** |
| `docker-build` | após test | build multi-stage → push imagem para **GHCR** (tag `:sha-<7chars>` + `:latest`) |
| `deploy` | após docker-build, **nunca em PR** | Terraform (Kind + Postgres + metrics-server) → `kind load` → Kustomize com SHA → migration Job → rollout → smoke test |

**Secrets obrigatórios** (configurar em Settings → Secrets and variables → Actions):

| Secret | Usado em |
|--------|---------|
| `DB_PASSWORD` | Terraform (`TF_VAR_db_password`) e `DATABASE_URL` do Secret K8s |
| `JWT_SECRET` | Secret `oficina-api-secrets` no cluster |
| `EXTERNAL_WEBHOOK_TOKEN` | Secret `oficina-api-secrets` no cluster |

`GITHUB_TOKEN` é automático — usado para push da imagem no GHCR (nenhuma configuração necessária).

**Rastreabilidade:** cada imagem publicada no GHCR recebe a tag `sha-<7chars>` do commit que a gerou. O Kustomize sobrescreve a tag no manifesto do Deployment antes de aplicar, garantindo que o cluster sempre rode exatamente o código do commit que disparou o pipeline.

## Testes e qualidade

Comandos principais:

```bash
npm run build
npm run lint
npm run test
npm run test:e2e
npm run test:cov
npm run test:cov:critical
```

Análise SonarQube:

1. Gere cobertura antes do scan:

```bash
npm run test:cov
```

2. Execute o scanner:

```bash
docker run --rm -e SONAR_HOST_URL="http://host.docker.internal:9000" -e SONAR_TOKEN="<SEU_TOKEN>" -v "${PWD}:/usr/src" sonarsource/sonar-scanner-cli
```

## Entregáveis

### Fase 1

- Drawio (online): https://drive.google.com/file/d/1Gv8bTQnPdIEIPBtMnt4wfpOyKGaOIXs8/view?usp=sharing
- Drawio (local): [oficina-mecanica-drawio.drawio](oficina-mecanica-drawio.drawio)
- DAS: [docs/DAS.md](docs/DAS.md)
- Contexto Fase 1: [docs/contexto-fase-1.md](docs/contexto-fase-1.md)
- Débitos técnicos: [docs/debitos_tecnicos.md](docs/debitos_tecnicos.md)
- Relatório Sonar: [docs/relatorios/sonar-relatorio-final.md](docs/relatorios/sonar-relatorio-final.md)
- Vídeo Fase 1 (demonstração em 07:50:00): [docs/video/apresentacao-fase-1.txt](./video/apresentacao-fase-1.txt)

### Fase 2 — Sprint 1 (código + banco)

- Documentação de arquitetura (atualizada): [docs/DOCUMENTACAO_ARQUITETURA.md](docs/DOCUMENTACAO_ARQUITETURA.md)
- Schema Prisma: [prisma/schema.prisma](prisma/schema.prisma)
- Referência de requisitos Fase 2: [docs/ref/fase2.md](docs/ref/fase2.md)
- Repositório: https://github.com/marcosrenansilvafaria-afk/oficina-fiap.git

### Fase 2 — Sprint 2 (IaC + Kubernetes)

- Terraform (cluster + banco + metrics-server): [infra/](infra/)
- Kubernetes (Deployment, Service, ConfigMap, Secret, HPA, Job): [k8s/](k8s/)
- Dockerfile multi-stage: [Dockerfile](Dockerfile)
- Entrypoint de migration automática: [docker-entrypoint.sh](docker-entrypoint.sh)

### Fase 2 — Sprint 3 (CI/CD)

- Pipeline GitHub Actions: [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml)
- Imagens publicadas em: `ghcr.io/marcosrenansilvafaria-afk/oficina-fiap`
- Vídeo (demonstração em 07:50:00): [docs/video/apresentacao-fase-1.mp4](docs/video/apresentacao-fase-1.txt)
