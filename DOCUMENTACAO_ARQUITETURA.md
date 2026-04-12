# Documentação de Arquitetura e Entrega - Projeto Oficina (MVP)

> TODO: Este é um template orientado para avaliadores e desenvolvedores. Preencher incrementalmente.

---

# 1. Introdução

## 1.1 Contexto do problema

TODO: preencher — resumo do problema que o sistema resolve.

## 1.2 Objetivo do sistema

TODO: preencher — objetivo principal do backend (MVP) para gestão de oficina.

## 1.3 Escopo do MVP

- Ordens de Serviço (OS)
- Clientes
- Veículos
- Serviços
- Peças

TODO: detalhar limites do MVP (o que está fora do escopo).

---

# 2. Requisitos

## 2.1 Requisitos Funcionais

Obs: separar por fluxo de OS e gestão administrativa.

### 2.1.1 Fluxo de OS

- RF-OS-01: Criar Ordem de Serviço — TODO: detalhar payload e validações. (Criar OS)
- RF-OS-02: Adicionar itens (peça/serviço) à OS — TODO: regras de preço e estoque.
- RF-OS-03: Gerar orçamento (snapshot de preços) — TODO.
- RF-OS-04: Aprovar orçamento — TODO.
- RF-OS-05: Iniciar execução (somente se status = APROVADA) — TODO.
- RF-OS-06: Finalizar OS (regras: todos os itens concluídos) — TODO.
- RF-OS-07: Entregar veículo — TODO.
- RF-OS-08: Buscar/consultar OS por id/cliente/status — TODO.

### 2.1.2 Gestão administrativa

- RF-ADM-01: CRUD de Clientes — TODO.
- RF-ADM-02: CRUD de Veículos — TODO.
- RF-ADM-03: CRUD de Peças (estoque, preço) — TODO.
- RF-ADM-04: CRUD de Serviços — TODO.
- RF-ADM-05: Relatórios básicos (ex.: OS por status, faturamento) — TODO.

## 2.2 Requisitos Não Funcionais

### 2.2.1 Arquitetura

- Arquitetura: DDD + Clean Architecture (monolito modular).
- Camadas: Domain, Application (use-cases), Interfaces (HTTP), Infrastructure (repositories).
- Observação: repositórios em memória usados no MVP; documentar estratégia de migração para DB.

### 2.2.2 Segurança

- Autenticação/Autorização: Recomenda-se JWT com roles (admin, mecanico, cliente).
- Validação de input: usar DTOs e validação server-side (ex.: class-validator no NestJS).
- TODO: política de senhas, armazenamento seguro de segredos, escopo de tokens.

### 2.2.3 Performance (básico)

- Metas: respostas de API < 200–500ms em operações CRUD simples (meta indicativa).
- Limitação esperada: in-memory rápido; migrar para DB com índices para consultas.

### 2.2.4 Testes

- Estratégia: testes unitários para domínio e use-cases; testes de integração para controllers; E2E para fluxos críticos (workflow OS).
- Cobertura: objetivo 80% (se não alcançar, justificar em seção 7).

### 2.2.5 Deploy

- Build reproducível em Docker; usar `docker-compose` para orquestração local.
- CI: GitHub Actions recomendado para lint, build, test e scan de segurança.

---

# 3. Modelagem de Domínio (DDD)

## 3.1 Linguagem Ubíqua

- TODO: listar termos essenciais e definições (Ex.: Ordem de Serviço, Orçamento, Item, Peça, Serviço, Cliente, Veículo, Status: RECEBIDA, EM_DIAGNOSTICO, AGUARDANDO_APROVACAO, APROVADA, EM_ANDAMENTO, FINALIZADA).

## 3.2 Event Storming

- Descrever fluxos principais: criação OS → adicionar itens → gerar orçamento → aprovar → executar → finalizar → entregar.
- TODO: link para board Miro / imagem.

Inserir diagrama Event Storming aqui: TODO: Inserir diagrama (Miro / imagem)

## 3.3 Entidades e Agregados

- Agregado principal: `OrdemServico` (Aggregate Root)
  - Responsabilidades: manter itens, calcular totais, aplicar regras de negócio sobre status e transições.

- Entidades / Value Objects detectadas no código (preenchidas automaticamente):
  - `OrdemServico` — arquivo referência: src/domain/entities/ordem-servico.ts (TODO: revisar e copiar atributos relevantes)
  - `ItemOrdemServico` — src/domain/entities/item-ordem-servico.ts
  - `Cliente` — src/domain/entities/cliente.ts
  - `Peca` — src/domain/entities/peca.ts
  - `Servico` — src/domain/entities/servico.ts
  - `Veiculo` — src/domain/entities/veiculo.ts

> TODO: para cada entidade preencher atributos, invariantes e exemplos de uso.

## 3.4 Regras de Negócio

- RN-01: Não pode alterar itens após aprovação do orçamento (regra central).
- RN-02: Revisão gera novo orçamento (versionamento) — TODO: detalhar.
- RN-03: Execução só inicia se status = APROVADA.
- RN-04: Finalização somente quando todos os itens marcados como concluídos.
- RN-05: Ajuste de estoque ao adicionar/consumir peças — sincronização eventual.

TODO: mapear outras regras encontradas no código e nos use-cases.

---

# 4. Arquitetura de Software

## 4.1 Visão Geral (HLD)

- Arquitetura adotada: DDD + Clean Architecture em aplicação NestJS.
- Descrição: monolito modular com separação clara entre domínio, casos de uso, interfaces e infra.

Inserir diagrama HLD aqui: TODO: Inserir C4/CAMADA/arquitetura (PNG/SVG/Link).

## 4.2 Modelo C4

### 4.2.1 Contexto

- Sistema: Backend da Oficina (MVP) — expõe API para front-end/consumidores.
- Usuários: clientes, atendentes, mecânicos, administradores.

### 4.2.2 Containers

- API (NestJS) — aplica casos de uso; endpoints REST.
- Database (opcional) — futuro RDBMS/NoSQL.
- Serviços externos (opcional): gateway de pagamentos, serviço de notificações.

### 4.2.3 Componentes

- Controllers (HTTP) — adaptadores de entrada: `src/interfaces/http/*`.
- Use-Cases / Application Services — `src/application/use-cases/*`.
- Domain Entities — `src/domain/entities/*`.
- Repositories (Infra) — `src/infraestructure/*` (in-memory atualmente).

## 4.3 Low Level Design (LLD)

- Estrutura de código (exemplo):

```
src/
  domain/
    entities/
  application/
    use-cases/
  interfaces/
    http/
  infraestructure/
    in-memory-*.ts
```

- Camadas e responsabilidades: Domain (regras), Application (orquestra use-cases), Interfaces (adapters), Infrastructure (repositorios, singletons).

## 4.4 Decisões Arquiteturais (ADR)

Este projeto registra decisões arquiteturais importantes como ADRs (Architecture Decision Records). Abaixo há ADRs já tomadas e um modelo para novos registros.

### ADRs registradas

- **ADR-001 — Adotar DDD para modelagem do domínio**
  - Data: TODO: inserir data
  - Decisão: Utilizar Domain-Driven Design para modelagem do núcleo de domínio.
  - Motivo: Complexidade das regras de negócio relacionadas a Ordens de Serviço, versionamento de orçamentos e transições de estado.
  - Alternativas consideradas: abordagem anêmica (DTOs sem domínio), modelagem simples sem aggregates.
  - Impactos: código mais orientado a domínio, testes focados em invariantes, curva de aprendizado para contributors.

- **ADR-002 — Adotar Clean Architecture**
  - Data: TODO
  - Decisão: Separar camadas (Domain, Application, Interfaces, Infrastructure) seguindo princípios da Clean Architecture.
  - Motivo: Isolar regras de negócio de frameworks e permitir portabilidade/ testabilidade.
  - Impactos: convenções de código, camadas e dependências explicitadas.

- **ADR-003 — Persistência inicial em repositórios In-Memory**
  - Data: TODO
  - Decisão: Usar repositórios em memória para MVP e testes.
  - Motivo: Agilidade na prototipagem e execução de testes sem dependências externas.
  - Plano de migração: documentar modelo de dados e criar adaptadores para RDBMS (ex.: Postgres) ou NoSQL mais à frente.

- **ADR-004 — Framework: NestJS**
  - Data: TODO
  - Decisão: Utilizar NestJS como framework backend.
  - Motivo: Estrutura modular, suporte a decorators, integração com `@nestjs/swagger`, boa experiência de desenvolvimento.

### Modelo de ADR (usar para novos registros)

```
Title: ADR-XXX - Título da decisão
Date: YYYY-MM-DD
Status: proposed | accepted | deprecated
Context: Breve descrição do contexto e por que a decisão é necessária
Decision: O que foi decidido
Consequences: Impactos técnicos e organizacionais
Alternatives: Alternativas consideradas e por que foram rejeitadas
```

Salvar ADRs em `docs/adr/ADR-XXX.md`.

---

# 5. API

## 5.1 Endpoints

Listagem detectada (preenchida automaticamente a partir de controllers):

- `src/interfaces/http/ordem-servico.controller.ts` — endpoints de OS (criar, adicionar itens, gerar orçamento, aprovar, iniciar execução, finalizar, entregar, buscar)
- `src/interfaces/http/cliente.controller.ts` — endpoints de cliente (CRUD)
- `src/interfaces/http/peca.controller.ts` — endpoints de peça (CRUD, ajustar estoque)
- `src/interfaces/http/servico.controller.ts` — endpoints de serviço (CRUD)
- `src/interfaces/http/veiculo.controller.ts` — endpoints de veículo (CRUD)

Para cada endpoint preencher:

- Método e rota: `POST /ordens`, `GET /ordens/:id`, etc. — TODO: extrair do código e completar.
- Descrição: TODO
- Request (exemplo): TODO
- Response (exemplo): TODO

## 5.2 Swagger / OpenAPI

- TODO: instruções para geração de documentação OpenAPI (ex.: decorators NestJS + `@nestjs/swagger`).
- Espaço para link: TODO — inserir link para Swagger UI ou arquivo `openapi.yaml`.

---

# 6. Segurança

- Autenticação recomendada: JWT
  - TODO: justificar escolha e documentar fluxo (login, refresh tokens, roles).
- Validação de dados: DTOs, pipes de validação (ex.: `class-validator`).
- Exposição mínima de dados: aplicar DTOs de saída (sem expor campos sensíveis).

TODO: seção para políticas de segurança, checklist de configuração de secrets, HTTPS, CORS, rate limiting.

---

# 7. Testes

- Estratégia:
  - Unit tests: domínio e use-cases.
  - Integration tests: controllers + repositorios.
  - E2E tests: fluxo completo (ex.: `test/workflow.e2e-spec.ts`).

- Ferramentas sugeridas: Jest, Supertest para E2E.
- Cobertura: meta 80% — se não for atingida, justificar analiticamente.

TODO: preencher matrix de testes (lista de casos prioritários) e comandos para rodar.

---

# 8. Infraestrutura

## 8.1 Dockerfile

Exemplo de `Dockerfile` para construir a API (Node + NestJS). Ajustar `NODE_ENV`, versão do Node e scripts conforme `package.json`.

```dockerfile
# Stage 1 — build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2 — runtime
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

Notas:
- Em desenvolvimento local pode-se usar `npm run start:dev` sem Docker.
- Para usar variáveis de ambiente sensíveis, usar secrets/CSVs no CI ou `docker secrets` em produção.

## 8.2 docker-compose

Exemplo `docker-compose.yml` com a API e um Postgres opcional (ajustar se optar por DB):

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgres://postgres:postgres@db:5432/oficina
    depends_on:
      - db
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=oficina
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

## 8.3 Execução local

Comandos mínimos (exemplo):

```bash
npm install
npm run build
npm run start:dev
```

Para executar com Docker Compose:

```bash
docker compose up --build
# ou (Windows cmd):
# docker-compose up --build
```

Para rodar apenas a API em container:

```bash
docker build -t oficina-api .
docker run -p 3000:3000 --env NODE_ENV=production oficina-api
```

TODO: substituir `DATABASE_URL` e secrets por valores do ambiente/CI.

---

# 9. Qualidade de Software

- Boas práticas aplicadas:
  - Separação de camadas (DDD + Clean)
  - Nomeclatura consistente (Linguagem Ubíqua)
  - Repositórios com interface explícita
  - Uso de DTOs e validação

- Ferramentas de qualidade recomendadas: ESLint, Prettier, SonarCloud/Scanner.

TODO: anexar políticas de lint e formato de commits (Conventional Commits).

---

# 10. Análise de Vulnerabilidades

- Espaço para resultados de scan: TODO

- Processo recomendado:
  - `npm audit` + `npm audit fix` como passo inicial
  - SCA em CI (dependabot, Snyk ou similares)

TODO: adicionar resultados e justificativas após execução do scan.

---

# 11. Execução do Projeto

## 11.1 Como rodar (local)

1. Pré-requisitos: Node >= TODO, npm/yarn, Docker (opcional).
2. Instalar dependências: `npm install`.
3. Rodar em dev: `npm run start:dev`.

## 11.2 Scripts úteis

- `npm run test` — rodar testes unitários
- `npm run test:e2e` — rodar testes E2E (se configurado)
- `npm run lint` — rodar lint

TODO: confirmar comandos no `package.json`.

---

# 12. Entregáveis

- Repositório: TODO: link do repositório (inserir URL)
- Documentação: `DOCUMENTACAO_ARQUITETURA.md` (este arquivo) + `docs/` (links abaixo)
- Participantes:
  - TODO: listar nomes e papéis

Referências locais já presentes no repositório:

- `docs/contexto.md` — contexto do domínio
- `docs/debitos_tecnicos.md` — débito técnico
- `docs/Fase1-DDD.drawio.png` — diagrama DDD
- Arquivos de domínio e infraestrutura:
  - `src/domain/entities/ordem-servico.ts`
  - `src/domain/entities/item-ordem-servico.ts`
  - `src/domain/entities/cliente.ts`
  - `src/domain/entities/peca.ts`
  - `src/domain/entities/servico.ts`
  - `src/domain/entities/veiculo.ts`
  - `src/application/use-cases/` (coleção de use-cases)
  - `src/interfaces/http/` (controllers)
  - `src/infraestructure/in-memory-*.ts`

---

# 13. Considerações Finais

- Decisões de MVP: TODO — listar o que foi decidido para manter o escopo enxuto.
- Limitações conhecidas: TODO — por exemplo, persistência em memória, ausência de auth pronta, cobertura parcial de testes.
- Próximos passos:
  1. Completar documentação das APIs e contratos (OpenAPI).
  2. Implementar persistência em DB e migração de dados.
  3. Melhorias de segurança (JWT, HTTPS, secrets management).

---

## Checklists Rápidos (para entrega)

- [ ] Documento preenchido em 100% (TODOs resolvidos)
- [ ] Diagrama(s) anexados (Event Storming, C4, HLD)
- [ ] Endpoints documentados (OpenAPI/Swagger)
- [ ] Instruções de execução e Docker presentes
- [ ] Testes críticos (E2E) funcionando
- [ ] Vulnerability scan rodado e analisado

---

## Notas finais

Este arquivo é um template rico — não escreva textos finais em todas as seções de uma vez; preencha incrementalmente à medida que o projeto evolui. Para mudanças estruturais sugeridas, mantenha um ADR atualizado em `docs/adr/`.

TODO: adicionar link para `docs/adr/` e modelo de ADR.
