import { Injectable } from '@nestjs/common';
import { EntityManager, LockMode } from '@mikro-orm/core';
import { InjectEntityManager } from '@mikro-orm/nestjs';
import { AmountDto } from './dto/amount.dto';
import { CreatePlayerDto } from './dto/create-player.dto';
import { InsufficientBalanceError } from '../domain/errors';
import { Player } from '../domain/player.entity';
import { Transaction, TransactionType } from '../domain/transaction.entity';

const MAX_AMOUNT_CENTS = 2_147_483_647;

@Injectable()
export class WalletService {
  constructor(
    @InjectEntityManager('default')
    private readonly em: EntityManager,
  ) {}

  async createPlayer(dto: CreatePlayerDto): Promise<Player> {
    const player = this.em.create(Player, {
      name: dto.name,
      email: dto.email,
      createdAt: new Date(),
    });
    this.em.persist(player);
    await this.em.flush();
    return player;
  }

  async deposit(playerId: string, dto: AmountDto): Promise<Transaction> {
    return this.createTransaction(playerId, dto, TransactionType.DEPOSIT);
  }

  async bet(playerId: string, dto: AmountDto): Promise<Transaction> {
    return this.createTransaction(playerId, dto, TransactionType.BET);
  }

  async win(playerId: string, dto: AmountDto): Promise<Transaction> {
    return this.createTransaction(playerId, dto, TransactionType.WIN);
  }

  async getBalance(playerId: string): Promise<number> {
    await this.em.findOneOrFail(Player, { id: playerId });
    const transactions = await this.em.find(Transaction, {
      player: playerId,
    });

    return this.calculateBalance(transactions);
  }

  async listTransactions(playerId: string): Promise<Transaction[]> {
    await this.em.findOneOrFail(Player, { id: playerId });
    return this.em.find(
      Transaction,
      { player: playerId },
      { orderBy: { createdAt: 'desc' } },
    );
  }

  private async createTransaction(
    playerId: string,
    dto: AmountDto,
    type: TransactionType,
  ): Promise<Transaction> {
    this.validateAmount(dto.amountCents);

    return this.em.transactional(async (em) => {
      const player = await em.findOneOrFail(
        Player,
        { id: playerId },
        { lockMode: LockMode.PESSIMISTIC_WRITE },
      );

      if (type === TransactionType.BET) {
        const transactions = await em.find(Transaction, { player: playerId });
        const balance = this.calculateBalance(transactions);

        if (balance < dto.amountCents) {
          throw new InsufficientBalanceError();
        }
      }

      const transaction = em.create(Transaction, {
        player,
        type,
        amountCents: dto.amountCents,
        createdAt: new Date(),
      });
      em.persist(transaction);
      await em.flush();
      return transaction;
    });
  }

  private calculateBalance(transactions: Transaction[]): number {
    return transactions.reduce((balance, transaction) => {
      const direction =
        transaction.type === TransactionType.BET ? -1 : 1;
      const updatedBalance = balance + direction * transaction.amountCents;

      if (!Number.isSafeInteger(updatedBalance)) {
        throw new RangeError('Wallet balance exceeds the safe integer range');
      }

      return updatedBalance;
    }, 0);
  }

  private validateAmount(amountCents: number): void {
    if (
      !Number.isSafeInteger(amountCents) ||
      amountCents < 1 ||
      amountCents > MAX_AMOUNT_CENTS
    ) {
      throw new RangeError(
        `amountCents must be an integer between 1 and ${MAX_AMOUNT_CENTS}`,
      );
    }
  }
}
