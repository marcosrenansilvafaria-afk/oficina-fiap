# Documentação de Arquitetura e Entrega - Projeto Oficina (MVP)

Documento em evolução incremental, com foco em decisões arquiteturais e rastreabilidade técnica.

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

Critérios de sucesso do MVP:

- Garantir rastreabilidade de ponta a ponta do fluxo da OS (criação até entrega)
- Manter consistência das transições de status por regra de domínio
- Permitir consulta operacional de OS e cadastros com resposta estável via API

## 1.3 Escopo do MVP

- Ordens de Serviço (OS)
- Clientes
- Veículos
- Serviços
- Peças

Fora do escopo (MVP):

- Autenticação JWT avançada (refresh token, revogação e rotação)
- Persistência em banco de dados (produção)
- Monitoramento avançado (tempo médio e KPIs complexos)
- Controle avançado de estoque

Observação de escopo: autenticação JWT foi implementada de forma simplificada no MVP (access token).

---

# 2. Requisitos

## 2.1 Requisitos Funcionais

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

- Validação de entrada: campos obrigatórios, formato de documento (CPF/CNPJ), placa e tipos de item da OS.
- Validação de regra: transições de estado e pré-condições da OS são validadas no domínio.
- Autenticação/autorização: JWT (access token) e RBAC básico implementados no MVP.
- Política de token: payload mínimo (`sub`, `role`) e expiração padrão de 1h.
- Sem refresh token no MVP: decisão intencional para reduzir complexidade inicial em ambiente controlado.
- Tratamento de erro: padronização de erros de validação e regra de negócio deve ser aplicada na camada HTTP (plano de evolução).

### 2.2.3 Performance

- Uso de armazenamento in-memory garante baixo tempo de resposta esperado para o MVP.

### 2.2.4 Testes

- Testes automatizados parciais: testes de domínio e testes de fluxo principal (E2E) parcialmente implementados.

### 2.2.5 Deploy

- Aplicação containerizada com Docker (`Dockerfile`) e orquestração local via `docker-compose.yml`.
- Escopo de infraestrutura no MVP: apenas serviço da API.
- Justificativa da ausência de banco no compose: persistência em memória adotada no MVP.

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
  
![Texto alternativo](docs/image/eventStorming2.png)  

[Drawio](https://drive.google.com/file/d/1Gv8bTQnPdIEIPBtMnt4wfpOyKGaOIXs8/view?usp=sharing)

## 3.3 Entidades e Agregados

O domínio foi modelado utilizando o conceito de Aggregate do Domain-Driven Design, garantindo consistência e controle das regras de negócio.

### 3.3.1 Bounded Contexts (visão atual)

- Contexto Ordem de Serviço (núcleo): concentra regras transacionais e ciclo de vida da OS.
- Contexto Cadastro: cliente e veículo como entidades referenciadas por identificador.
- Contexto Catálogo: serviços e peças usados como base para composição dos itens da OS.

Observação arquitetural: no estado atual do MVP, os contextos convivem no mesmo monólito modular. A separação é lógica (domínio e responsabilidades) e não física (serviços independentes).

### Aggregate Root

#### OrdemServico

A entidade OrdemServico é o Aggregate Root do sistema, sendo responsável por:

- Controlar o ciclo de vida da OS
- Garantir as regras de negócio
- Gerenciar os itens associados
- Controlar o status da operação

Apenas o Aggregate Root pode ser manipulado diretamente por outros componentes do sistema.

![DDD Oficina](docs/image/Oficina-DDD.png)  

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

Isso garante consistência de regra de negócio no contexto do MVP e no fluxo operacional previsto.

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

Regras explicitamente fora do escopo desta etapa:

- Controle transacional de concorrência em nível de banco (será tratado após migração de persistência)
- Estratégia de cancelamento de OS em estados avançados (a definir em evolução de negócio)
- Reserva de estoque com lock otimista/pessimista (planejado para fase com banco relacional)

# 4. Arquitetura de Software

## 4.1 Visão Geral (HLD)

- Arquitetura adotada: DDD + Clean Architecture em aplicação NestJS.
- Descrição: monolito modular com separação clara entre domínio, casos de uso, interfaces e infra.

Diagramas de arquitetura (C4) atualmente documentados:

- C1 (Contexto): `docs/image/C1_Oficina_Context.png`
- C2 (Containers): `docs/image/C2_Oficina_Container.png`
- C3 (Componentes): `docs/image/C3_Oficina_Component.png`
- Fluxo de autenticação (sequência): `docs/image/fluxoAutenticacao.png`

Observação: o nível C4 (código) será elaborado em etapa posterior por ser mais orientado a desenvolvedores e depender da estabilização final dos módulos internos.

## 4.2 Modelo C4

### 4.2.1 Contexto

- Sistema: Backend da Oficina (MVP) — expõe API para front-end/consumidores.
- Usuários: clientes, atendentes e mecânicos.

![C1 - Contexto](docs/image/C1_Oficina_Context.png)

### 4.2.2 Containers

- API (NestJS) — aplica casos de uso; endpoints REST.
- Repositórios In-Memory — persistência temporária utilizada no MVP e durante a fase inicial de testes.
- Database (futuro) — substituição planejada dos repositórios in-memory por RDBMS/NoSQL após a fase de testes.
- Serviços externos (opcional): gateway de pagamentos, serviço de notificações.

Justificativa de modelagem: no diagrama C2, a persistência atual é representada como repositório in-memory (e não como banco de dados), pois este é o mecanismo efetivamente implementado no momento. O banco de dados aparece como elemento futuro para deixar explícito o plano de migração.

![C2 - Containers](docs/image/C2_Oficina_Container.png)

### 4.2.3 Componentes

- Controllers (HTTP) — adaptadores de entrada: `src/interfaces/http/*`.
- Use-Cases / Application Services — `src/application/use-cases/*`.
- Domain Entities — `src/domain/entities/*`.
- Repositories (Infra) — `src/infraestructure/*` (in-memory atualmente, com substituição planejada após fase de testes).

![C3 - Componentes](docs/image/C3_Oficina_Component.png)

### 4.2.4 Código (C4)

- Nível não documentado nesta etapa.
- Justificativa: o diagrama de código é direcionado principalmente ao time de desenvolvimento e será produzido após estabilização da estrutura interna de módulos, interfaces e contratos.

### 4.2.5 Fluxo de autenticação JWT (sequência)

- Login via `POST /auth/login` retorna `access_token` com expiração de 1h.
- Endpoints protegidos usam `Authorization: Bearer <token>`.
- Validação ocorre com `JwtAuthGuard` + `JwtStrategy` e autorização com `RolesGuard`.

![Fluxo de Autenticacao JWT](docs/image/fluxoAutenticacao.png)

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

Aderência arquitetural e lacunas atuais:

- A separação por camadas está presente na estrutura de pastas.
- O domínio concentra regras de negócio de ciclo de vida da OS, porém há oportunidades de reforçar isolamento por interfaces (ports) para persistência.
- A evolução recomendada é reduzir acoplamento entre casos de uso e implementações concretas de repositório por contratos explícitos.
- Para produção, recomenda-se consolidar estratégia de erros de domínio -> erros HTTP de forma padronizada.

## 4.4 Decisões Arquiteturais (ADR)

Este projeto registra decisões arquiteturais importantes como ADRs (Architecture Decision Records). Abaixo há ADRs já tomadas e um modelo para novos registros.

### ADRs registradas

- **ADR-001 — Modelagem de domínio com DDD**
  - Status: Aceito
  - Data: 2026-04-18
  - Contexto: o fluxo de OS possui regras de transição, validações e invariantes que exigem modelagem explícita.
  - Decisão: adotar DDD no núcleo de domínio, com foco em aggregate root `OrdemServico` e linguagem ubíqua.
  - Alternativas consideradas: modelo anêmico com regras distribuídas em controllers/services; scripts transacionais sem agregados.
  - Consequências positivas: maior consistência das regras, melhor testabilidade de invariantes, documentação mais alinhada ao negócio.
  - Consequências negativas: curva de aprendizado e maior disciplina de modelagem.

- **ADR-002 — Estrutura em Clean Architecture**
  - Status: Aceito
  - Data: 2026-04-18
  - Contexto: necessidade de separar domínio de infraestrutura e framework para reduzir acoplamento e facilitar evolução.
  - Decisão: manter camadas Domain, Application, Interfaces e Infrastructure no monólito modular.
  - Alternativas consideradas: arquitetura em camadas sem regra de dependência explícita; abordagem orientada apenas ao framework.
  - Consequências positivas: maior clareza de responsabilidades e evolução progressiva de adaptadores.
  - Consequências negativas: necessidade de reforçar contratos (ports/interfaces) para plena inversão de dependência.

- **ADR-003 — Persistência inicial em memória no MVP**
  - Status: Aceito
  - Data: 2026-04-18
  - Contexto: fase MVP prioriza validação de domínio, fluxo de negócio e testes iniciais sem custo operacional de banco.
  - Decisão: utilizar repositórios in-memory como persistência temporária.
  - Alternativas consideradas: adoção imediata de RDBMS; adoção imediata de NoSQL.
  - Consequências positivas: velocidade de entrega, ambiente simples para testes iniciais.
  - Consequências negativas: ausência de durabilidade e limitações para cenários concorrentes reais.
  - Plano de migração: substituir por banco de dados após fase de testes e estabilização das regras.

- **ADR-004 — Adoção de NestJS como framework backend**
  - Status: Aceito
  - Data: 2026-04-18
  - Contexto: necessidade de produtividade, modularidade e base consistente para API REST.
  - Decisão: adotar NestJS como framework principal do backend.
  - Alternativas consideradas: Express puro; Fastify sem estrutura modular definida no projeto.
  - Consequências positivas: organização por módulos, integração nativa com validação e Swagger.
  - Consequências negativas: acoplamento a convenções do framework e necessidade de disciplina para preservar limites de domínio.

- **ADR-005 — Monólito modular no MVP (em vez de microserviços)**
  - Status: Aceito
  - Data: 2026-04-18
  - Contexto: escopo do MVP e equipe exigem baixa complexidade operacional e foco na regra de negócio.
  - Decisão: manter monólito modular com separação lógica por contexto.
  - Alternativas consideradas: decomposição precoce em microserviços.
  - Consequências positivas: menor custo operacional, debugging simplificado, entrega mais rápida.
  - Consequências negativas: escala independente por domínio adiada para fases futuras.

- **ADR-006 — Estratégia de persistência pós-testes (RDBMS primário)**
  - Status: Proposto
  - Data: 2026-04-18
  - Contexto: após validação funcional do MVP, será necessária persistência durável e consistência transacional.
  - Decisão: adotar banco relacional como persistência primária da OS (ex.: PostgreSQL), mantendo abstração de repositório.
  - Alternativas consideradas: manutenção do in-memory; migração direta para NoSQL sem necessidade comprovada.
  - Consequências positivas: integridade referencial, durabilidade e melhor suporte a consultas operacionais.
  - Consequências negativas: aumento de complexidade de infraestrutura, migração de dados e testes de integração.

- **ADR-007 — Estratégia de autenticação e autorização (JWT + RBAC)**
  - Status: Aceito
  - Data: 2026-04-18
  - Contexto: endpoints administrativos e operacionais exigirão controle de acesso por perfil.
  - Decisão: adotar JWT para autenticação stateless e RBAC para autorização por papel.
  - Implementação no MVP: `POST /auth/login` com usuário mock in-memory, access token com expiração de 1h e payload mínimo (`sub`, `role`).
  - Escopo da implementação MVP: sem refresh token e sem persistência de usuários, mantendo simplicidade operacional inicial.
  - Alternativas consideradas: autenticação por sessão; API key única para todos os perfis.
  - Consequências positivas: controle granular de acesso e integração simples com APIs.
  - Consequências negativas: gestão de ciclo de token fica parcial no MVP (refresh/revogação planejados para evolução).

- **ADR-008 — Estratégia de testes e quality gate**
  - Status: Proposto
  - Data: 2026-04-18
  - Contexto: o crescimento do domínio exige proteção contra regressão em regras de negócio e fluxo HTTP.
  - Decisão: definir pirâmide de testes com unitário (domínio/use-case), integração (repositórios/adaptadores) e E2E (fluxo crítico).
  - Alternativas consideradas: foco apenas em E2E; foco apenas em unitário.
  - Consequências positivas: feedback mais rápido e cobertura mais robusta de regras.
  - Consequências negativas: aumento de esforço inicial para setup e manutenção da suíte.

- **ADR-009 — Versionamento de API**
  - Status: Proposto
  - Data: 2026-04-18
  - Contexto: evolução de contratos HTTP sem quebra de clientes exige estratégia explícita de compatibilidade.
  - Decisão: versionar endpoints por prefixo (`/v1`) e manter política de depreciação.
  - Alternativas consideradas: versionamento apenas por header; ausência de versionamento explícito.
  - Consequências positivas: previsibilidade para consumidores e governança de mudanças.
  - Consequências negativas: manutenção paralela temporária de versões em transições.

- **ADR-010 — Padronização de erros e observabilidade mínima**
  - Status: Proposto
  - Data: 2026-04-18
  - Contexto: operação e suporte exigem rastreabilidade de falhas de domínio e infraestrutura.
  - Decisão: padronizar envelope de erro na API, mapear exceções de domínio para respostas consistentes e adotar logs estruturados com correlation id.
  - Alternativas consideradas: tratamento ad-hoc por controller; logging sem estrutura.
  - Consequências positivas: troubleshooting mais rápido e menor ambiguidade para consumidores da API.
  - Consequências negativas: necessidade de disciplina de implementação em toda a camada HTTP.

### Modelo de ADR (usar para novos registros)

```
Title: ADR-XXX - Título da decisão
Status: proposed | accepted | superseded | deprecated
Date: YYYY-MM-DD
Context:
  - Problema arquitetural e motivação
  - Restrições e premissas
Decision:
  - Decisão tomada
  - Escopo da decisão
Alternatives:
  - Opção A (prós/contras)
  - Opção B (prós/contras)
Consequences:
  - Positivas
  - Negativas/trade-offs
Follow-up Actions:
  - Ação técnica necessária para consolidar a decisão
```

Salvar ADRs em `docs/adr/ADR-XXX.md`.

---

# 5. API

## 5.1 Endpoints

Endpoints mapeados a partir dos controllers da aplicação (prefixos reais de rota):

### Ordem de Serviço (`/os`)

- `POST /os`
  - Descrição: cria uma OS.
  - Request (exemplo):
    ```json
    {
      "clienteId": "uuid-opcional",
      "veiculoId": "uuid-opcional"
    }
    ```
  - Respostas:
    - `200`: OS criada.
    - `400`: `clienteId`/`veiculoId` inválidos.

- `POST /os/:id/item`
  - Descrição: adiciona item (serviço/peça) à OS.
  - Request (exemplo):
    ```json
    {
      "tipo": "SERVICO",
      "idReferencia": "uuid-servico-ou-peca",
      "quantidade": 1
    }
    ```
  - Respostas:
    - `200`: item adicionado.
    - `404`: OS não encontrada.
    - `400`: violação de regra de domínio.

- `POST /os/:id/orcamento`
- `POST /os/:id/diagnostico`
- `POST /os/:id/aprovar`
- `POST /os/:id/executar`
- `POST /os/:id/finalizar`
- `POST /os/:id/entregar`
  - Descrição: transições do fluxo da OS.
  - Respostas comuns:
    - `200`: transição aplicada.
    - `404`: OS não encontrada.
    - `400`: transição inválida para o status atual.

- `GET /os/:id`
  - Descrição: consulta OS por identificador.
  - Respostas: `200`/`404`.

- `GET /os`
  - Descrição: lista OS.

### Clientes (`/clientes`)

- `POST /clientes`
  - Request: `{ "nome": "...", "documento": "..." }`
  - Respostas: `200`/`400`.

- `GET /clientes/:id`
  - Respostas: `200`/`404`.

- `GET /clientes`

### Veículos (`/veiculos`)

- `POST /veiculos`
  - Request: `{ "placa": "...", "modelo": "...", "marca": "...", "ano": 2024 }`
  - Respostas: `200`/`400`.

- `GET /veiculos/:id`
- `GET /veiculos`

### Serviços (`/servicos`)

- `POST /servicos`
  - Request: `{ "nome": "...", "preco": 120.0 }`
  - Respostas: `200`/`400`.

- `GET /servicos/:id`
- `GET /servicos`

### Peças (`/pecas`)

- `POST /pecas`
  - Request: `{ "nome": "...", "preco": 50.0, "estoque": 10 }`
  - Respostas: `200`/`400`.

- `PATCH /pecas/:id/estoque`
  - Request: `{ "delta": -1 }`
  - Respostas: `200`/`400`.

- `GET /pecas/:id`
- `GET /pecas`

Padronização de erro (estado atual):

- Exceções de validação e regra de domínio são mapeadas principalmente para `400`.
- Recursos inexistentes são mapeados para `404`.
- A padronização de envelope de erro ficará na evolução do ADR-010.

## 5.2 Swagger / OpenAPI

Implementação concluída:

- Dependências instaladas:
  - `@nestjs/swagger`
  - `swagger-ui-express`
- Bootstrap configurado em `src/main.ts` com `DocumentBuilder` e `SwaggerModule`.
- Endpoints publicados:
  - UI interativa: `/docs`
  - JSON OpenAPI: `/docs-json`

Como validar funcionamento:

1. Subir a aplicação:
  ```bash
  npm run start:dev
  ```
2. Abrir a UI do Swagger no navegador:
  - `http://localhost:3000/docs`
3. Validar se o JSON OpenAPI está acessível:
  - `http://localhost:3000/docs-json`
4. Confirmar que os controllers principais aparecem na documentação:
  - `/os`, `/clientes`, `/veiculos`, `/servicos`, `/pecas`

Observações importantes:

- Os endpoints já utilizam DTOs específicos para request body, com propriedades documentadas via `@ApiProperty`.
- Controllers principais estão decorados com `@ApiTags`, `@ApiOperation`, `@ApiBody` e `@ApiResponse` para melhorar descrição de operações e respostas.
- Evolução recomendada: adotar validação automática com `class-validator` + `ValidationPipe` e enriquecer schemas de resposta tipando DTOs de saída.

---

# 6. Segurança

Estado atual (MVP):

- Autenticação JWT ativa no endpoint `POST /auth/login` e nos endpoints administrativos protegidos.
- Autorização RBAC básica por perfil (`ADMIN`, `MECANICO`, `ATENDENTE`) aplicada na camada HTTP com guards.
- Validação de entrada implementada de forma pontual nos controllers/use-cases.
- Persistência em memória (sem dados sensíveis persistidos em disco pela aplicação).

Fluxo de autenticação implementado:

1. Cliente envia `email` e `senha` para `POST /auth/login`.
2. A API valida o usuário mock in-memory do MVP.
3. A API retorna `{ access_token }` JWT com claims mínimas (`sub`, `role`) e expiração de 1h.
4. Em endpoints protegidos, o cliente envia `Authorization: Bearer <token>`.

Matriz RBAC implementada no fluxo de OS:

- `POST /os`, `POST /os/:id/item`, `POST /os/:id/orcamento`, `POST /os/:id/aprovar`, `POST /os/:id/entregar` → `ATENDENTE`
- `POST /os/:id/diagnostico`, `POST /os/:id/executar`, `POST /os/:id/finalizar` → `MECANICO`
- `ADMIN` → acesso total aos endpoints protegidos.

Endpoints públicos no MVP:

- `GET /os` e `GET /os/:id` permanecem públicos, pois o MVP assume ambiente controlado para validação rápida do fluxo operacional.

Estratégia alvo (pós-MVP):

- Autenticação: evoluir para JWT com access token + refresh token.
- Autorização: RBAC por perfil operacional.
- Hardening de API:
  - CORS restrito por ambiente.
  - Rate limiting por IP/cliente.
  - Segredos via variáveis de ambiente e cofre/CI.
  - Uso obrigatório de HTTPS em ambientes não-locais.

Checklist de segurança para entrega técnica:

- [ ] Definir claims e tempo de expiração de tokens.
- [ ] Definir matriz de permissões por endpoint.
- [ ] Definir política de rotação de secrets.
- [ ] Padronizar resposta de erro sem vazamento de detalhes internos.

---

# 7. Testes

Estratégia adotada:

- Unit tests: regras de domínio e casos de uso.
- E2E tests: fluxos HTTP críticos.
- Integração: parcialmente coberta pelos testes E2E devido à persistência in-memory.

Justificativa do método:

- Pirâmide de testes aplicada para reduzir custo de manutenção e aumentar velocidade de feedback.
- Regras críticas de negócio ficam protegidas por testes unitários de domínio (entidades) e de aplicação (use-cases).
- Fluxos HTTP ponta a ponta permanecem validados por E2E, garantindo contrato funcional mínimo.

Artefatos atuais:

- `test/app.e2e-spec.ts`
- `test/workflow.e2e-spec.ts`
- `src/domain/entities/*.spec.ts` (ciclo da OS, itens, estoque e entidades de cadastro)
- `src/application/use-cases/*.spec.ts` (fluxo crítico da OS, busca, cadastro e listagem)

Comandos oficiais (package.json):

- `npm run test`
- `npm run test:watch`
- `npm run test:cov`
- `npm run test:cov:critical`
- `npm run test:e2e`

Ferramentas:

- Jest
- Supertest

Meta e quality gate sugeridos para evolução:

- Cobertura mínima: `>= 80%` em domínio + use-cases.
- Gate de CI:
  - build
  - lint
  - test
  - test:e2e

Automação implementada no repositório:

- Workflow de CI em `.github/workflows/ci.yml` executando build, lint, unit, e2e e cobertura crítica.
- Threshold obrigatório de cobertura crítica definido em `jest.critical.config.js` com mínimo de `80%` para statements, branches, functions e lines.

Resultado atual (escopo crítico medido com `test:cov:critical`):

- Statements: `97.9%`
- Branches: `92.78%`
- Functions: `100%`
- Lines: `99.53%`

Conclusão: requisito de cobertura mínima `>= 80%` para domínios críticos atendido.

Matriz mínima de cenários críticos:

- Criação de OS com referência válida/inválida de cliente/veículo.
- Transições válidas e inválidas de status.
- Geração/aprovação de orçamento.
- Ajuste de estoque de peça com delta positivo/negativo.
- Busca de recursos inexistentes (`404`).

---

# 8. Infraestrutura

## 8.1 Dockerfile

Estado atual:

- O repositório possui `Dockerfile` funcional para build e execução da API NestJS.

Características implementadas:

- Build da aplicação com `npm run build`.
- Runtime via `node dist/main.js`.
- Exposição da porta `3000`.
- Uso de imagem Node LTS baseada em Alpine.

## 8.2 docker-compose

Estado atual:

- O repositório possui `docker-compose.yml` versionado com um único serviço (`api`).

Configuração atual:

- Serviço `api` construído a partir do `Dockerfile` local.
- Mapeamento de portas `3000:3000`.
- Política de reinício `restart: always`.
- Comentário de evolução para futura inclusão de PostgreSQL (não implementado no MVP).

## 8.3 Execução local

Comandos válidos para o estado atual do projeto:

```bash
npm install
npm run build
npm run start:dev
docker-compose up --build
```

Observações:

- `npm run start:prod` depende de build prévio em `dist`.
- A API pode ser executada em container via Docker Compose em `http://localhost:3000`.
- Persistência em memória é mantida no container por decisão de escopo do MVP.

---

# 9. Qualidade de Software

Objetivo de qualidade:

- Reduzir regressão funcional no fluxo de OS.
- Garantir consistência arquitetural entre domínio, casos de uso e interfaces HTTP.
- Aplicar validação contínua em build, lint e testes automatizados.

Padrões e políticas adotadas:

- Linting: ESLint (`npm run lint`).
- Formatação: Prettier (`npm run format`).
- Testes: Jest + Supertest (`npm run test`, `npm run test:e2e`).
- Contrato de API: Swagger/OpenAPI publicado em `/docs` e `/docs-json`.

Quality gate recomendado para CI:

1. `npm run build`
2. `npm run lint`
3. `npm run test`
4. `npm run test:e2e`
5. `npm audit --omit=dev`

Política de versionamento e commits:

- Recomenda-se Conventional Commits para rastreabilidade de mudança arquitetural e funcional.
- Recomenda-se branch strategy baseada em feature branch + PR com revisão obrigatória.

Critérios mínimos para aceite de PR:

- Build sem erros.
- Sem erro de lint.
- Testes locais (unit + e2e) verdes.
- Mudanças de contrato refletidas no Swagger.

---

# 10. Análise de Vulnerabilidades

Baseline atual (executado em 2026-04-18):

- `npm audit --json`: 12 vulnerabilidades no total (7 moderadas, 4 altas, 1 crítica) considerando todo o grafo.
- `npm audit --omit=dev`: 3 vulnerabilidades altas em dependências de produção:
  - `@nestjs/core`
  - `path-to-regexp`
  - `@nestjs/platform-express`

Processo operacional de tratamento:

1. Executar auditoria em toda alteração relevante:
   - `npm audit --omit=dev`
2. Aplicar correções automáticas seguras:
   - `npm audit fix`
3. Reexecutar build e testes após correção:
   - `npm run build`
   - `npm run test`
   - `npm run test:e2e`
4. Registrar risco residual no PR quando a atualização não puder ser aplicada imediatamente.

Política de severidade sugerida:

- Crítica/Alta em dependência de produção: bloquear release até mitigação ou exceção formal documentada.
- Moderada: corrigir no próximo ciclo planejado.
- Baixa: tratar por backlog técnico com janela definida.

Evolução recomendada:

- Habilitar SCA contínuo (Dependabot/Snyk/GitHub Advisory) no pipeline.
- Definir SLA de correção por severidade para governança de segurança.

---

# 11. Execução do Projeto

## 11.1 Como rodar (local)

1. Pré-requisitos: Node >= TODO, npm/yarn, Docker (opcional).
2. Instalar dependências: `npm install`.
3. Rodar em dev: `npm run start:dev`.

## 11.2 Scripts úteis

- `npm run test` — rodar testes unitários
- `npm run test:cov` — cobertura global (inclui toda a base)
- `npm run test:cov:critical` — cobertura do escopo crítico (domínio + use-cases)
- `npm run test:e2e` — rodar testes E2E (se configurado)
- `npm run lint` — rodar lint

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
- **Limitações conhecidas:** persistência em memória (não persistente entre execuções), autenticação sem refresh token no MVP, cobertura de testes parcial e monitoramento simplificado.
- **Próximos passos:**
  1. Evoluir documentação de contrato com DTOs de resposta e padronização de erros no OpenAPI/Swagger.
  2. Implementar persistência em DB e plano de migração.
  3. Evoluir segurança com refresh token, revogação e política de rotação de segredo.
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
