# Oficina FIAP - MVP Backend

Backend do desafio de oficina mecanica com foco em fluxo de Ordem de Servico (OS), autenticacao JWT e entrega incremental baseada em DDD + Clean Architecture.

## Objetivo

Disponibilizar uma API simples e rastreavel para:
- Criar e acompanhar Ordens de Servico.
- Gerenciar clientes, veiculos, pecas e servicos.
- Simular envio de orcamento ao cliente.
- Garantir controle de acesso com JWT + RBAC.

## Stack

- Node.js 20+
- NestJS 11
- TypeScript
- Swagger
- Docker / Docker Compose

## Como executar localmente

Crie um arquivo `.env` baseado no `.env.example`


### Executar sem Docker

1. Instale dependencias:

```bash
npm install
```

2. Execute em modo desenvolvimento:

```bash
npm run start:dev
```

3. Acesse a API:
- http://localhost:3000

4. Acesse a documentacao Swagger:
- http://localhost:3000/docs

## Executar com Docker

```bash
docker-compose up --build
```

API disponivel em:
- http://localhost:3000

## Testes e qualidade

Comandos principais:

```bash
npm run build
npm run lint
npm run test
npm run test:e2e
```

Cobertura critica:

```bash
npm run test:cov:critical
```

## Seguranca e vulnerabilidades

Analise SonarQube (quando ambiente disponivel):

```bash
# gerar cobertura antes do scan
npm run test:cov

# executar scanner via Docker
docker run --rm -e SONAR_HOST_URL="http://host.docker.internal:9000" -e SONAR_TOKEN="<SEU_TOKEN>" -v "${PWD}:/usr/src" sonarsource/sonar-scanner-cli
```

### Relatorio SonarQube (onde inserir)

Após executar o scan, registrar o resultado em `DOCUMENTACAO_ARQUITETURA.md`, na seção 10 (Análise de Vulnerabilidades), incluindo:
- Link do dashboard do projeto no SonarQube.
- Data/hora da análise.
- Status do Quality Gate.
- Principais métricas (Coverage, Bugs, Vulnerabilities, Code Smells).

Fallback obrigatorio (MVP):
- Registrar analise conceitual de riscos em `DOCUMENTACAO_ARQUITETURA.md`.
- Cobrir autenticacao, validacao de dados, exposicao de informacoes e tratamento de erros.

## Documentacao do projeto

- Arquitetura: `DOCUMENTACAO_ARQUITETURA.md`
- DAS: `docs/DAS.md`
- ADRs: `docs/adr/README.md`
- Debitos tecnicos: `docs/debitos_tecnicos.md`
