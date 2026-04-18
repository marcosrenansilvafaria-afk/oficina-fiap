# Documentação de Arquitetura e Entrega - Projeto Oficina (MVP)

> TODO: Este é um template orientado para avaliadores e desenvolvedores. Preencher incrementalmente.

---

# 1. Introdução

## 1.1 Contexto do problema

A oficina mecânica enfrentava problemas operacionais devido ao uso de processos manuais e planilhas, resultando em:

- Falhas no controle de serviços
- Dificuldade no acompanhamento do status das ordens
- Perda de histórico de clientes e veículos
- Ineficiência no fluxo de aprovação de orçamentos

O sistema proposto busca centralizar e organizar esses processos, garantindo rastreabilidade e controle.

## 1.2 Objetivo do sistema

Desenvolver um backend (MVP) para gestão de Ordens de Serviço (OS), permitindo:

- Controle do ciclo completo de atendimento
- Organização dos dados de clientes e veículos
- Gestão de serviços e peças
- Acompanhamento do status da OS via API

## 1.3 Escopo do MVP

- Ordens de Serviço (OS)
- Clientes
- Veículos
- Serviços
- Peças

Fora do escopo (MVP):

- Autenticação completa (JWT avançado)
- Persistência em banco de dados (produção)
- Monitoramento avançado (tempo médio e KPIs complexos)
- Controle avançado de estoque

---

# 2. Requisitos

## 2.1 Requisitos Funcionais

Obs: separar por fluxo de OS e gestão administrativa.

### 2.1.1 Fluxo de OS

- **RF-OS-01: Gestão de Ordem de Serviço (ALTO IMPACTO)**
  - Funcionalidades: Criação de OS, associação com cliente e veículo, inclusão de serviços e peças, geração automática de orçamento, aprovação de orçamento, execução, finalização, entrega do veículo e consulta de OS.
  - Status da OS: RECEBIDA, EM_DIAGNOSTICO, AGUARDANDO_APROVACAO, APROVADA, EM_EXECUCAO, FINALIZADA, ENTREGUE.
  - Implementação no repositório: núcleo do domínio implementado com controle de estados.

- **RF-OS-02: Criar Ordem de Serviço**
  - Entrada: `clienteId`, `veiculoId`.
  - Validação: cliente e veículo devem existir.

- **RF-OS-03: Adicionar itens**
  - Permitido apenas em: RECEBIDA, EM_DIAGNOSTICO.
  - Tipos: `SERVICO` | `PECA`.

- **RF-OS-04: Gerar orçamento**
  - Soma automática dos itens e snapshot de preços.

- **RF-OS-05: Aprovar orçamento**
  - Altera status para `APROVADA`.

- **RF-OS-06: Iniciar execução**
  - Apenas se status = `APROVADA`.

- **RF-OS-07: Finalizar OS**
  - Apenas se status = `EM_EXECUCAO`.

- **RF-OS-08: Entregar veículo**
  - Apenas se status = `FINALIZADA`.

- **RF-OS-09: Consultar OS**
  - `GET` por id e listagem geral.

### 2.1.2 Gestão administrativa

- **RF-ADM-01: Cliente**
  - Criar cliente (CPF/CNPJ), buscar cliente.

- **RF-ADM-02: Veículo**
  - Criar veículo (placa, modelo, marca, ano), buscar veículo.

- **RF-ADM-03: Peças**
  - Cadastro simples, controle básico de estoque (campo numérico).

- **RF-ADM-04: Serviços**
  - Cadastro simples.

- **RF-ADM-05: Relatórios**
  - Não implementado no MVP (fora do escopo).

## 2.2 Requisitos Não Funcionais

### 2.2.1 Arquitetura

- Monólito em camadas com DDD aplicado no domínio e Clean Architecture para separar responsabilidades.
- Camadas: Domain, Application (use-cases), Interfaces (HTTP/controllers), Infrastructure (repositórios).
- Implementação atual: persistência em memória (in-memory) para MVP; migrar para banco quando necessário.

### 2.2.2 Segurança

- Validação básica de dados (documento, campos obrigatórios) está implementada.
- JWT: não implementado no MVP (decisão consciente para focar no domínio). Recomenda-se implementação futura para endpoints administrativos.

### 2.2.3 Performance

- Uso de armazenamento in-memory garante baixo tempo de resposta esperado para o MVP.

### 2.2.4 Testes

- Testes automatizados parciais: testes de domínio e testes de fluxo principal (E2E) parcialmente implementados.

### 2.2.5 Deploy

- Containerização básica (Docker) prevista; configuração deve ser adicionada para deploy reproducível.

---

# 3. Modelagem de Domínio (DDD)

## 3.1 Linguagem Ubíqua

O sistema utiliza uma linguagem ubíqua alinhada ao domínio de oficinas mecânicas, garantindo consistência entre código, documentação e regras de negócio.

### Termos principais

- Ordem de Serviço (OS): representa o ciclo completo de atendimento de um veículo
- Cliente: solicitante do serviço
- Veículo: objeto do atendimento
- Item da OS: componente da ordem (serviço ou peça)
- Serviço: atividade executada (ex: troca de óleo)
- Peça: insumo utilizado

### Status da Ordem de Serviço

- RECEBIDA
- EM_DIAGNOSTICO
- AGUARDANDO_APROVACAO
- APROVADA
- EM_EXECUCAO
- FINALIZADA
- ENTREGUE

### Ações do domínio

- Diagnosticar  
- Gerar orçamento
- Aprovar orçamento
- Executar serviço
- Finalizar OS
- Entregar veículo

## 3.2 Event Storming

- Fluxo Principal (extraído do contexto do projeto):
  1. Criar OS (cliente + veículo)
  2. Iniciar diagnóstico
  3. Adicionar itens
  4. Gerar orçamento
  5. Aprovar orçamento
  6. Executar
  7. Finalizar
  8. Entregar

TODO: link para board Miro / imagem (inserir diagrama Event Storming em `docs/`).

## 3.3 Entidades e Agregados

O domínio foi modelado utilizando o conceito de Aggregate do Domain-Driven Design, garantindo consistência e controle das regras de negócio.

### Aggregate Root

#### OrdemServico

A entidade OrdemServico é o Aggregate Root do sistema, sendo responsável por:

- Controlar o ciclo de vida da OS
- Garantir as regras de negócio
- Gerenciar os itens associados
- Controlar o status da operação

Apenas o Aggregate Root pode ser manipulado diretamente por outros componentes do sistema.

📌 Inserir diagrama do Aggregate aqui (OS + itens)

---

### Entidades internas ao Aggregate

#### ItemOrdemServico

Representa um item dentro da Ordem de Serviço.

Pode ser de dois tipos:
- SERVICO (mão de obra)
- PECA (insumo)

Atributos:
- tipo
- descricao
- preco
- quantidade

Observação:
Os itens não existem fora do contexto da OrdemServico.

---

### Entidades externas ao Aggregate

#### Cliente (Bounded Context: Cadastro)

Representa o solicitante do serviço.

Atributos:
- id
- nome
- documento (CPF/CNPJ)

Observação:
É referenciado pela OrdemServico, mas não pertence ao aggregate.

---

#### Veiculo (Bounded Context: Cadastro)

Representa o veículo atendido.

Atributos:
- id
- placa
- marca
- modelo
- ano

Observação:
Assim como Cliente, é uma entidade externa referenciada.

---

#### Serviço (Bounded Context: Catálogo)

Define os tipos de serviços disponíveis.

---

#### Peça (Bounded Context: Catálogo)

Define os insumos disponíveis para utilização.

---

### Consistência do Aggregate

Todas as regras de negócio são garantidas dentro do Aggregate OrdemServico, incluindo:

- Controle de status
- Inclusão de itens
- Transições de estado
- Validação de fluxo

Isso garante que o sistema permaneça consistente mesmo em cenários concorrentes.

## 3.4 Regras de Negócio

As regras de negócio foram centralizadas no Aggregate OrdemServico, garantindo consistência e previsibilidade no fluxo do sistema.

---

### Regras de criação

- Uma Ordem de Serviço só pode ser criada se:
  - Cliente existir
  - Veículo existir

---

### Regras de itens

- Itens só podem ser adicionados nos status:
  - RECEBIDA
  - EM_DIAGNOSTICO

- Ao adicionar um item:
  - O valor total da OS deve ser recalculado

---

### Regras de orçamento

- O orçamento deve ser gerado antes da aprovação
- Ao gerar orçamento:
  - Status muda para AGUARDANDO_APROVACAO

---

### Regras de aprovação

- Apenas ordens em AGUARDANDO_APROVACAO podem ser aprovadas
- Após aprovação:
  - Status muda para APROVADA

---

### Regras de execução

- Execução só pode iniciar se:
  - Status = APROVADA

- Ao iniciar execução:
  - Status muda para EM_EXECUCAO

---

### Regras de finalização

- A OS só pode ser finalizada se:
  - Status = EM_EXECUCAO

- Após finalização:
  - Status muda para FINALIZADA

---

### Regras de entrega

- A OS só pode ser entregue se:
  - Status = FINALIZADA

- Após entrega:
  - Status muda para ENTREGUE

---

### Regras de ajuste (fluxo alternativo)

- É possível retornar a OS para diagnóstico quando:
  - Status = AGUARDANDO_APROVACAO

- Esse fluxo permite:
  - Inclusão de novos itens
  - Regeração de orçamento

---

### Regras de integridade

- Não é permitido pular estados
- Todas as transições devem seguir o fluxo definido
- Todas as validações são realizadas dentro do Aggregate

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

- **Decisões de MVP:** priorizar o núcleo do domínio (Ordem de Serviço), fluxos críticos e clareza arquitetural; persistência em memória para acelerar desenvolvimento e testes.
- **Limitações conhecidas:** persistência em memória (não persistente entre execuções), JWT não implementado no MVP, cobertura de testes parcial e monitoramento simplificado.
- **Próximos passos:**
  1. Completar documentação das APIs e contratos (OpenAPI/Swagger).
  2. Implementar persistência em DB e plano de migração.
  3. Implementar autenticação/autorizações (JWT) para endpoints administrativos.
  4. Expandir testes unitários e integração para atingir meta de cobertura.

---

Conforme descrito em `docs/contexto.md`, o sistema foi desenvolvido como MVP contemplando requisitos obrigatórios com níveis diferentes de profundidade, priorizando o domínio central e a entrega funcional ponta a ponta.

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
