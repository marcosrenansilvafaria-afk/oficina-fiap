# Oficina FIAP - MVP Backend

## Sumário

- [Objetivo](#objetivo)
- [Stack](#stack)
- [Como usar o `.env`](#como-usar-o-env)
- [Como executar localmente](#como-executar-localmente)
- [Testes e qualidade](#testes-e-qualidade)
- [Entregáveis](#entregáveis)

Backend do desafio de oficina mecânica com foco em fluxo de Ordem de Serviço (OS), autenticação JWT e entrega incremental baseada em DDD + Clean Architecture.

## Objetivo

Disponibilizar uma API simples e rastreável para:
- Criar e acompanhar Ordens de Serviço.
- Gerenciar clientes, veículos, peças e serviços.
- Simular envio de orçamento ao cliente.
- Garantir controle de acesso com JWT + RBAC.

## Stack

- Node.js 20+
- NestJS 11
- TypeScript
- Swagger
- Docker / Docker Compose

## Como usar o `.env`

Crie o arquivo `.env` copiando o modelo `.env.example` para a raiz do projeto.

```bash
copy .env.example .env
```

Variáveis atuais:

- `JWT_SECRET`: chave usada para assinar os tokens JWT. Use uma string longa, aleatória e diferente entre ambientes.
- `PORT`: porta em que a API sobe localmente. O padrão é `3000`.
- `SEED_DATA`: quando `true`, pré-carrega dados mínimos (in-memory) para acelerar a demo no Swagger.

Seed (quando `SEED_DATA=true`):

- Cliente: `cli-001`
- Veículo: `vei-001`
- Serviço: `srv-001`
- Peça: `pec-001`

Observações:

- O seed roda apenas no startup e não sobrescreve dados existentes.
- Como a persistência é in-memory, os dados são perdidos ao reiniciar o processo.
- Se alterar `SEED_DATA`, reinicie a API.

Boas práticas:

- Nunca versionar `.env`.
- Em ambiente local, mantenha valores simples e previsíveis.
- Em produção, prefira secrets do ambiente/CI e rotacione a chave quando necessário.
- Se alterar `JWT_SECRET`, todos os tokens emitidos anteriormente deixam de ser válidos.

## Como executar localmente

### Sem Docker

1. Instale dependências:

```bash
npm install
```

2. Execute em modo desenvolvimento:

```bash
npm run start:dev
```

3. Acesse a API:
- http://localhost:3000

4. Acesse a documentação Swagger:
- http://localhost:3000/docs

Ordem recomendada para demo (fluxo da OS):

1. `POST /auth/login` (obter token JWT).
2. `POST /clientes`, `POST /veiculos`, `POST /servicos`, `POST /pecas`.
3. `POST /os`.
4. `POST /os/:id/diagnostico`.
5. `POST /os/:id/item`.
6. `POST /os/:id/orcamento` e `POST /os/:id/enviar-orcamento`.
7. `POST /os/:id/aprovar`.
8. `POST /os/:id/executar` e `POST /os/:id/finalizar`.
9. `GET /os/sla-atendimento`.
10. `POST /os/:id/entregar`.
11. `GET /os/:id` e `GET /os`.

### Com Docker

```bash
docker-compose up --build
```

API disponível em:
- http://localhost:3000

## Testes e qualidade

Comandos principais:

```bash
npm run build
npm run lint
npm run test
npm run test:e2e
npm run test:cov
npm run test:cov:critical
```

Análise SonarQube:

1. Gere cobertura antes do scan:

```bash
npm run test:cov
```

2. Execute o scanner:

```bash
docker run --rm -e SONAR_HOST_URL="http://host.docker.internal:9000" -e SONAR_TOKEN="<SEU_TOKEN>" -v "${PWD}:/usr/src" sonarsource/sonar-scanner-cli
```

## Entregáveis

- Drawio (online): https://drive.google.com/file/d/1Gv8bTQnPdIEIPBtMnt4wfpOyKGaOIXs8/view?usp=sharing
- Drawio (local): [oficina-mecanica-drawio.drawio](oficina-mecanica-drawio.drawio)
- Documentação de arquitetura: [docs/DOCUMENTACAO_ARQUITETURA.md](docs/DOCUMENTACAO_ARQUITETURA.md)
- DAS: [docs/DAS.md](docs/DAS.md)
- Contexto: [docs/contexto.md](docs/contexto.md)
- Débitos técnicos: [docs/debitos_tecnicos.md](docs/debitos_tecnicos.md)
- Relatório Sonar: [docs/relatorios/sonar-relatorio-final.md](docs/relatorios/sonar-relatorio-final.md)
- Repositório: https://github.com/marcosrenansilvafaria-afk/oficina-fiap.git
- Vídeo (demonstração em 07:50:00): [docs/video/apresentacao-fase-1.mp4](./video/apresentacao-fase-1.txt)
