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

## Como executar localmente (sem Docker)

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

## Como executar com Docker

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
# requer servidor SonarQube acessivel
sonar-scanner
```

Fallback obrigatorio (MVP):
- Registrar analise conceitual de riscos em `DOCUMENTACAO_ARQUITETURA.md`.
- Cobrir autenticacao, validacao de dados, exposicao de informacoes e tratamento de erros.

## Documentacao do projeto

- Arquitetura: `DOCUMENTACAO_ARQUITETURA.md`
- DAS: `docs/DAS.md`
- ADRs: `docs/adr/README.md`
- Debitos tecnicos: `docs/debitos_tecnicos.md`
