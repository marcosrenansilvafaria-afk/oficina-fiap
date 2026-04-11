# 📌 Contexto do Projeto — Sistema de Oficina Mecânica

## 🎯 Objetivo

Este projeto tem como objetivo implementar um sistema backend para gestão de Ordens de Serviço (OS) em uma oficina mecânica, aplicando conceitos de:

- Domain-Driven Design (DDD)
- Clean Architecture
- Boas práticas de desenvolvimento backend

---

## 🧠 Domínio

O domínio principal é o gerenciamento de Ordens de Serviço.

Uma Ordem de Serviço representa todo o ciclo de atendimento de um veículo dentro da oficina, desde a criação até a entrega.

---

## 🧱 Arquitetura

O sistema segue os princípios de Clean Architecture:

### Camadas:

- **Domain**
  - Entidades e regras de negócio
  - Independente de frameworks

- **Application**
  - Casos de uso
  - Orquestra o domínio

- **Interfaces**
  - Controllers HTTP (NestJS)
  - Entrada do sistema

- **Infrastructure**
  - Persistência e integrações externas

---

## ⚠️ Regras Arquiteturais

- O domínio NÃO depende de nenhuma outra camada
- Casos de uso NÃO possuem regra de negócio
- Controllers NÃO possuem lógica de negócio
- Toda regra deve estar no domínio

---

## 🧩 Modelo de Domínio

### Aggregate Root

- OrdemServico

### Entidades

#### OrdemServico
- id
- status:
  - RECEBIDA
  - EM_DIAGNOSTICO
  - AGUARDANDO_APROVACAO
  - APROVADA
  - EM_ANDAMENTO
  - FINALIZADA
  - ENTREGUE
- itens
- valorTotal

#### ItemOrdemServico
- tipo (SERVICO | PECA)
- descricao
- preco
- quantidade

---

## 📜 Regras de Negócio

- Não é possível adicionar itens após aprovação
- O orçamento deve ser gerado antes da aprovação
- Não é possível iniciar execução sem aprovação
- Não é possível finalizar sem estar em execução
- Não é possível entregar sem estar finalizada

---

## 🔁 Fluxo do Sistema

1. Criar Ordem de Serviço
2. Adicionar itens (serviços/peças)
3. Gerar orçamento
4. Aprovar orçamento
5. Iniciar execução
6. Finalizar serviço
7. Entregar veículo

---

## ⚙️ Casos de Uso

- CriarOrdemServico
- AdicionarItemOrdemServico
- GerarOrcamento
- AprovarOrcamento
- IniciarExecucao
- FinalizarOrdemServico
- EntregarVeiculo

---

## 🌐 Endpoints

- POST /os
- POST /os/:id/item
- POST /os/:id/orcamento
- POST /os/:id/aprovar
- POST /os/:id/executar
- POST /os/:id/finalizar
- POST /os/:id/entregar
- GET  /os/:id

---

## 🗄️ Persistência

- Atualmente em memória (objeto em runtime)
- Não há banco de dados implementado
- Decisão tomada para simplificar o escopo do projeto

---

## 🧠 Decisões Arquiteturais

### Uso de DDD
Separação clara entre domínio e infraestrutura para garantir escalabilidade e manutenibilidade.

### Uso de Clean Architecture
Organização em camadas para desacoplamento e testabilidade.

### Uso de NestJS
Framework escolhido pela organização modular e suporte a boas práticas.

### Uso de armazenamento em memória
Adotado para simplificar o desenvolvimento e focar na modelagem de domínio.

---

## 🎯 Objetivo da Implementação

- Demonstrar domínio de arquitetura de software
- Aplicar conceitos de DDD na prática
- Entregar um sistema funcional com API REST
- Priorizar clareza e organização ao invés de complexidade

---

## 🚫 Fora do Escopo

- Autenticação
- Persistência avançada
- Testes automatizados completos
- Segurança avançada