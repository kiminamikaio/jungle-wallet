import { randomUUID } from 'node:crypto';
import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { Player } from './player.entity';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  BET = 'BET',
  WIN = 'WIN',
}

@Entity()
export class Transaction {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => Player)
  player!: Player;

  @Enum(() => TransactionType)
  type!: TransactionType;

  @Property({ type: 'integer' })
  amountCents!: number;

  @Property()
  createdAt: Date = new Date();
}
