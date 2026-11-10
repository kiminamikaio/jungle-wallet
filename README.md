# Jungle Wallet

## Sobre

API de carteira de jogador para cassino online. Permite cadastrar jogadores e
registrar depósitos, apostas e prêmios, além de consultar o saldo e o extrato
de transações.

## Stack

- NestJS
- TypeScript
- MikroORM 7
- PostgreSQL 16
- Docker
- Jest

## Decisões

- Valores monetários são armazenados em centavos inteiros (`amountCents`).
- O saldo é calculado a partir das transações: depósitos + prêmios - apostas.
- A aposta é executada dentro de uma transação e bloqueia o registro do jogador
  durante a operação, evitando gasto duplo em requisições concorrentes.
- Uma aposta sem saldo suficiente retorna HTTP `422`.
- Uma operação para um jogador inexistente retorna HTTP `404`.

## Estrutura das pastas

```text
src/wallet/
├── domain/         # Entidades e regras de domínio
├── application/    # Serviços e DTOs da aplicação
├── infra/          # Configuração do MikroORM e acesso à infraestrutura
├── migrations/     # Migrações do banco de dados
└── presentation/   # Controllers e camada HTTP
```

## Como rodar

Requer Node.js, npm e Docker instalados. Na raiz do projeto:

```bash
docker compose up -d
npm install
npx mikro-orm migration:up
npm run start:dev
```

A API ficará disponível em `http://localhost:3000`. O Docker Compose inicia o
PostgreSQL 16 com as configurações padrão do projeto.

## Exemplos de curl

Crie um jogador e use o `id` retornado nos exemplos seguintes:

```bash
curl -X POST http://localhost:3000/players \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ana Silva","email":"ana@example.com"}'
```

Deposite 10,00 (1000 centavos):

```bash
curl -X POST http://localhost:3000/players/<PLAYER_ID>/deposit \
  -H 'Content-Type: application/json' \
  -d '{"amountCents":1000}'
```

Registre uma aposta de 2,50 (250 centavos):

```bash
curl -X POST http://localhost:3000/players/<PLAYER_ID>/bet \
  -H 'Content-Type: application/json' \
  -d '{"amountCents":250}'
```

Registre um prêmio de 5,00 (500 centavos):

```bash
curl -X POST http://localhost:3000/players/<PLAYER_ID>/win \
  -H 'Content-Type: application/json' \
  -d '{"amountCents":500}'
```

Consulte o saldo, retornado em centavos:

```bash
curl http://localhost:3000/players/<PLAYER_ID>/balance
```

Consulte o extrato:

```bash
curl http://localhost:3000/players/<PLAYER_ID>/transactions
```

## Testes

```bash
npm test
```

## Próximos passos

- Implementar idempotência para operações financeiras.
- Disponibilizar atualizações de saldo em tempo real via WebSocket.
- Integrar uma fila SQS.
- Configurar CI.

## Uso de IA

Usei o GitHub Copilot em modo agente para gerar a estrutura, as entidades, o
serviço, o controller e os testes. Revisei cada etapa e corrigi o que veio
errado:

- A IA moveu a configuração do MikroORM e o CLI de migrations parou de
  encontrá-la. Ajustei o caminho.
- O projeto passava no build e nos testes, mas não subia: a injeção do
  `EntityManager` estava errada. Descobri testando os endpoints com `curl`.
- Defini as regras de negócio: centavos inteiros, sem `float`, e aposta com
  bloqueio dentro de transação.
