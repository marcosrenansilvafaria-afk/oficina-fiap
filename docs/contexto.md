# 📌 Contexto do Projeto — Sistema de Oficina Mecânica (MVP)

---

## 🎯 Objetivo

Desenvolver um sistema backend (MVP) para gestão de Ordens de Serviço (OS) em uma oficina mecânica, aplicando:

- Domain-Driven Design (DDD)
- Clean Architecture
- Boas práticas de desenvolvimento

O sistema visa resolver problemas como:
- Desorganização do fluxo de atendimento
- Falta de rastreabilidade de serviços
- Dificuldade de acompanhamento de status
- Controle ineficiente de peças e serviços

---

# 🧠 Estratégia de Implementação (MVP)

Como se trata de um MVP, todos os requisitos foram considerados, porém implementados com diferentes níveis de profundidade, priorizando:

- Núcleo do domínio (Ordem de Serviço)
- Fluxos críticos do sistema
- Clareza arquitetural

---

# 🧩 REQUISITOS FUNCIONAIS

---

## 🔴 RF1 — Gestão de Ordem de Serviço (ALTO IMPACTO)

### Funcionalidades:

- Criação de OS
- Associação com cliente e veículo
- Inclusão de serviços e peças
- Geração automática de orçamento
- Aprovação de orçamento
- Execução e finalização
- Entrega do veículo
- Consulta de OS

### Status da OS:

- RECEBIDA  
- EM_DIAGNOSTICO  
- AGUARDANDO_APROVACAO  
- APROVADA  
- EM_EXECUCAO  
- FINALIZADA  
- ENTREGUE  

### Implementação:

✔ COMPLETA e com regras de domínio  
✔ Controle de estados garantido no domínio  

---

## 🟠 RF2 — Gestão de Cliente e Veículo (MÉDIO IMPACTO)

### Funcionalidades:

- Cadastro de cliente (CPF/CNPJ)
- Cadastro de veículo (placa, modelo, marca, ano)
- Associação com OS

### Implementação:

✔ CRUD básico (Create + Get)  
✔ Validação simplificada  

💡 Justificativa:
Foco no vínculo com OS, não na complexidade do cadastro

---

## 🟠 RF3 — Gestão de Serviços e Peças (MÉDIO IMPACTO)

### Funcionalidades:

- Cadastro de serviços
- Cadastro de peças
- Associação com OS
- Controle básico de estoque

### Implementação:

✔ CRUD simplificado  
✔ Estoque representado por campo numérico  

💡 Justificativa:
Controle simplificado suficiente para MVP

---

## 🟡 RF4 — Listagem e Consulta (MÉDIO/BAIXO IMPACTO)

### Funcionalidades:

- Listar OS
- Detalhar OS

### Implementação:

✔ Endpoint básico  

---

## 🟡 RF5 — Monitoramento de tempo (BAIXO IMPACTO)

### Funcionalidade:

- Tempo médio de execução

### Implementação:

⚠️ Simplificada / Não priorizada  

💡 Justificativa:
Baixo impacto no fluxo principal

---

# 🔐 REQUISITOS NÃO FUNCIONAIS

---

## 🔴 RNF1 — Arquitetura (ALTO IMPACTO)

- Monólito em camadas
- Separação de responsabilidades
- DDD aplicado no domínio

✔ Implementado completamente

---

## 🔴 RNF2 — API REST (ALTO IMPACTO)

- Endpoints RESTful
- Organização clara

✔ Implementado

---

## 🟠 RNF3 — Documentação (ALTO IMPACTO)

- README completo
- Descrição de arquitetura
- Endpoints documentados

✔ Implementado

---

## 🟡 RNF4 — Validação de dados (MÉDIO IMPACTO)

- CPF/CNPJ
- Placa

✔ Implementação simplificada  

💡 Justificativa:
Validação básica suficiente para MVP

---

## 🟡 RNF5 — Testes automatizados (MÉDIO IMPACTO)

- Testes de domínio
- Testes de fluxo principal

✔ Implementação parcial  

💡 Justificativa:
Foco nos fluxos críticos ao invés de cobertura total

---

## 🔵 RNF6 — Segurança (JWT) (BAIXO IMPACTO)

- Autenticação em endpoints administrativos

⚠️ Implementação simplificada ou parcial  

💡 Justificativa:
Não é crítico para validação do domínio no MVP

---

## 🔵 RNF7 — Banco de dados (MÉDIO IMPACTO)

- Persistência dos dados

✔ Implementação in-memory  

💡 Justificativa:
Foco na modelagem de domínio e simplicidade

---

## 🔵 RNF8 — Docker (BAIXO IMPACTO)

- Containerização da aplicação

⚠️ Implementação básica ou não priorizada  

---

## 🔵 RNF9 — Swagger (BAIXO IMPACTO)

- Documentação da API

✔ Implementação opcional  

---

# 🧱 Arquitetura

## Camadas:

- Domain → regras e entidades
- Application → casos de uso
- Interface → controllers HTTP
- Infrastructure → persistência

---

# 🧠 Decisões Arquiteturais

### DDD
Aplicado para garantir centralização das regras no domínio.

### Clean Architecture
Separação clara de responsabilidades.

### Persistência em memória
Adotada para reduzir complexidade e focar no domínio.

### Escopo controlado
Priorização do fluxo de OS como núcleo do sistema.

---

# 🔁 Fluxo Principal

1. Criar OS (cliente + veículo)
2. Iniciar diagnóstico
3. Adicionar itens
4. Gerar orçamento
5. Aprovar
6. Executar
7. Finalizar
8. Entregar

---

# 🎯 Conclusão

O sistema foi desenvolvido como MVP, contemplando todos os requisitos obrigatórios, porém com níveis diferentes de profundidade, priorizando:

- Domínio central
- Clareza arquitetural
- Funcionalidade ponta a ponta

Essa abordagem garante:
- Entrega funcional
- Escalabilidade futura
- Qualidade de modelagem