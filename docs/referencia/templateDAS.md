
Prioridade 
1 - Baixo (vaidade)
2 - Medio (Contribui funcionalmente)
3 - Alto (Requisito)
4 - Obrigatório (Sem isso não tem como entregar o projeto)

Complexidade
3 - Baixa 
2 - Média 
1 - Alta
0 - não da tempo, declarar debito tecnico

| Total  | Prioridade   | complexidade   | Pendencias |
|---|---|---|---|
| 5 | 3 | 2 | Analise de vulnerabilidades: SonarQube |
| 3 | 2 | 1 | implentação Banco de dados |
| 4 | 1 | 3 | Novos diagramas de caso de uso com plantUML |
| 4 | 1 | 3 | Commit ADR |
| 4 | 3 | 1 | Funcionalidade: Envio do orçamento ao cliente para aprovação. |
| 3 | 3 | 0 | Funcionalidade: CRUD de peças e insumos |
| 5 | 3 | 2 | Funcionalidade: Monitoramento do tempo médio de execução dos serviços |
| 4 | 3 | 1 | Funcionalidade: Validação dos dados sensíveis (CPF/CNPJ, placa de veículo) |
| 6 | 3 | 3 | (README explicativo com instruções de uso/execução local e objetivo) |
| 5 | 4 | 1 |  Video |
| 5 | 2 | 3 | DAS Design Approval Sheet |
| 6 | 3 | 3 |  repo com codigo fonte |

Nota: ADRs são documentos a parte que são referenciados no DAS. O DAS deve conter um resumo das decisões de arquitetura, enquanto os ADRs detalham cada decisão individualmente, cada adr deve ter um PR. "A das não é proposta, é a solução que será implementada.

---
**Template: Design Approval Sheet (DAS)**
--- 
**Projeto:** [Nome do Projeto]
**Data:** [Data De Criação]
**Versão:** [Versão]
**Identificador:** [Identificador Único do DAS]
---
**Contexto do Projeto**
Descreva o panorama geral e os objetivos principais do projeto. Explique o valor do sistema para
os usuários e a empresa.
---
**Requisitos do sistema**
**Funcionais:** liste as funcionalidades que o sistema deve oferecer aos usuários.
**Não-Funcion**ais: descreve requisitos de desempenho, segurança, disponibilidade e outros atributos de qualidade.
---
**Arquitetura e tecnologias**
Descreva as tecnologias escolhidas (front-end, back-end, banco de dados, autenticação e infraestrutura) e justifique cada escolha.
---
**Estrutura da arquitetura (C4 Model)**
**Contexto (C1):** descreva como o sistema interage com usuários e sistemas externos.
**Container (C2):** especifique os principais containers (front-end, back-end e banco de dados) e suas funções.
**Componentes (C3):** liste componentes internos, como serviços de autenticação ou notificações.
---
**Diagramas de arquitetura**
Inclua diagramas que ilustram a arquitetura: contexto, containers, componentes e sequência de processos.
---
**Restrições e decisões técnicas**
Documente quaisquer restrições e decisões de design importantes, como escolha de banco de dados ou provedores de infraestrutura.
---
**Documentação de requisitos funcionais e não-funcionais**
Detalhe as funcionalidades e as métricas para cada requisito não-funcional, como desempenho e segurança.
---
**Diagrama de implantação e configuração**
Inclua diagramas que representem a configuração de infraestrutura e instruções de instalação e configuração.
---
**ADR (Architecture Decision Record)**
Liste cada decisão importante de design, explicando o contexto, a decisão, as alternativas consideradas e o impacto da escolha.
---
**Plano de testes e monitoramento**
Descreva os tipos de testes e as ferramentas de monitoramento e alertas que serão usadas para
acompanhar o desempenho do sistema.
---
**Modelo de dados**
Forneça o diagrama de entidade-relacionamento (DER) do banco de dados, com tabelas e
relacionamentos.
---
**Documentação de API**
Documente os endpoints da API, incluindo métodos HTTP, parâmetros e exemplos de resposta.
---
