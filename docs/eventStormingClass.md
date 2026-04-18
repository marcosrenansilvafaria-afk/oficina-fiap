🧩 Exemplo: Sistema de CRM (igual da aula)
🔁 Fluxo completo (Event Storming organizado)
[Ator]
Usuário / Cliente

   ↓

🔵 Comando:
"Solicitar orçamento"

   ↓

🟠 Evento:
"Solicitação de orçamento recebida"

   ↓

🟣 Política:
"Se solicitação válida → gerar proposta automaticamente"

   ↓

🔵 Comando:
"Gerar proposta"

   ↓

🟠 Evento:
"Proposta gerada"

   ↓

🟣 Política:
"Enviar proposta para cliente"

   ↓

🔵 Comando:
"Enviar proposta"

   ↓

🟠 Evento:
"Proposta enviada"

   ↓

🟠 Evento (externo):
"Cliente aprovou proposta"

   ↓

🔵 Comando:
"Criar pedido"

   ↓

🟠 Evento:
"Pedido criado"
🧠 Agora o mais importante: EXPLICAÇÃO CLARA DE CADA ITEM
🟠 Evento de Domínio (Domain Event)

👉 Representa algo que já aconteceu e não pode ser alterado

Exemplos:

"Solicitação de orçamento recebida"
"Proposta gerada"
"Pedido criado"

💡 Dica prática:
Sempre no passado (termina com “-ado”, “-ida”)

🔵 Comando (Command)

👉 Representa uma intenção de ação

Exemplos:

"Solicitar orçamento"
"Gerar proposta"
"Enviar proposta"

💡 Dica:
Sempre começa com verbo no infinitivo

🟡 Ator (Actor)

👉 Quem inicia o processo

Exemplos:

Cliente
Usuário interno
Sistema externo

💡 Importante:
Actor NÃO executa lógica → só dispara comando

🟣 Política (Policy)

👉 Regra automática do sistema

Exemplo:

"Se orçamento recebido → gerar proposta"

💡 É tipo:

"quando X acontece → faça Y automaticamente"

Isso conecta com regras de negócio e automação do fluxo

🟢 Agregado (Aggregate)

👉 Onde a regra de negócio é garantida

Exemplo:

Orçamento
Proposta
Pedido

💡 Conceito da aula:
Agregado controla consistência e estado