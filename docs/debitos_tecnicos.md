# Débitos Técnicos

- **Decremento de estoque ao adicionar item na Ordem de Serviço**: hoje o fluxo de adicionar itens à OS não altera o estoque de `Peça`. Quando implementarmos controle de estoque completo, devemos:
  - Validar disponibilidade de `Peca` ao adicionar item (ou ao aprovar orçamento).
  - Decrementar o estoque com `peca.ajustarEstoque(-quantidade)` dentro de um caso de uso (ex.: `AdicionarItemOrdemServico` ou `AprovarOrcamento`).
  - Tratar rollback/consistência em operações falhas (reservas, transações ou logs de movimento).
  - Endpoint/fluxo sugerido: checar e reservar ao adicionar; confirmar decremento ao aprovar; liberar em cancelamento.

Referências de arquivos atuais:
- `src/interfaces/http/ordem-servico.controller.ts`
- `src/application/use-cases/adicionar-item-ordem-servico.ts`
- `src/domain/entities/peca.ts`
- `src/application/use-cases/ajustar-estoque-peca.ts`

Status: não iniciado. Prioridade: alta quando integrarmos estoque/peças ao fluxo de execução.
