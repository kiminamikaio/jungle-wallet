import { NotFoundError } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { AmountDto } from './dto/amount.dto';
import { InsufficientBalanceError } from '../domain/errors';
import { Player } from '../domain/player.entity';
import { Transaction, TransactionType } from '../domain/transaction.entity';
import { WalletService } from './wallet.service';

describe('WalletService', () => {
  const playerId = 'player-id';

  function createService() {
    const player = new Player();
    player.id = playerId;
    const transactions: Transaction[] = [];

    const em = {
      create: jest.fn(
        (entity: typeof Player | typeof Transaction, data: object) =>
          Object.assign(
            entity === Player ? new Player() : new Transaction(),
            data,
          ),
      ),
      persist: jest.fn((entity: Player | Transaction) => {
        if (entity instanceof Transaction) {
          transactions.push(entity);
        }
      }),
      flush: jest.fn(async () => undefined),
      findOneOrFail: jest.fn(
        async (entity: typeof Player, where: { id: string }) => {
          if (entity === Player && where.id === player.id) {
            return player;
          }

          throw NotFoundError.findOneFailed(entity.name, where);
        },
      ),
      find: jest.fn(
        async (_entity: typeof Transaction, where: { player: string }) =>
          transactions.filter(
            (transaction) => transaction.player.id === where.player,
          ),
      ),
      transactional: jest.fn(
        async <T>(callback: (manager: EntityManager) => Promise<T>) =>
          callback(em as unknown as EntityManager),
      ),
    };

    return {
      service: new WalletService(em as unknown as EntityManager),
      em,
      transactions,
    };
  }

  const amount = (amountCents: number): AmountDto => ({ amountCents });

  it('increases the balance after a deposit', async () => {
    const { service, transactions } = createService();

    await service.deposit(playerId, amount(1250));

    expect(await service.getBalance(playerId)).toBe(1250);
    expect(transactions).toHaveLength(1);
    expect(transactions[0].type).toBe(TransactionType.DEPOSIT);
  });

  it('decreases the balance after a bet', async () => {
    const { service } = createService();

    await service.deposit(playerId, amount(1250));
    await service.bet(playerId, amount(325));

    expect(await service.getBalance(playerId)).toBe(925);
  });

  it('rejects a bet greater than the balance without persisting a transaction', async () => {
    const { service, transactions } = createService();

    await service.deposit(playerId, amount(500));

    await expect(service.bet(playerId, amount(501))).rejects.toThrow(
      InsufficientBalanceError,
    );
    expect(transactions).toHaveLength(1);
    expect(transactions[0].type).toBe(TransactionType.DEPOSIT);
    expect(await service.getBalance(playerId)).toBe(500);
  });

  it('increases the balance after a prize', async () => {
    const { service } = createService();

    await service.deposit(playerId, amount(700));
    await service.win(playerId, amount(240));

    expect(await service.getBalance(playerId)).toBe(940);
  });

  it('calculates deposits plus prizes minus bets in whole cents', async () => {
    const { service, transactions } = createService();

    await service.deposit(playerId, amount(1501));
    await service.win(playerId, amount(299));
    await service.bet(playerId, amount(450));
    await service.deposit(playerId, amount(100));

    const expectedBalance =
      transactions
        .filter((transaction) => transaction.type === TransactionType.DEPOSIT)
        .reduce((sum, transaction) => sum + transaction.amountCents, 0) +
      transactions
        .filter((transaction) => transaction.type === TransactionType.WIN)
        .reduce((sum, transaction) => sum + transaction.amountCents, 0) -
      transactions
        .filter((transaction) => transaction.type === TransactionType.BET)
        .reduce((sum, transaction) => sum + transaction.amountCents, 0);

    expect(transactions.every((transaction) =>
      Number.isInteger(transaction.amountCents),
    )).toBe(true);
    expect(Number.isInteger(expectedBalance)).toBe(true);
    expect(await service.getBalance(playerId)).toBe(expectedBalance);
    expect(expectedBalance).toBe(1450);
  });

  it('throws a not-found error when the player does not exist', async () => {
    const { service } = createService();

    await expect(service.getBalance('missing-player')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
