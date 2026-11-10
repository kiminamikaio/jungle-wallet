import { randomUUID } from 'node:crypto';
import { Collection } from '@mikro-orm/core';
import { Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { Transaction } from './transaction.entity';

@Entity()
export class Player {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string', unique: true })
  email!: string;

  @Property()
  createdAt: Date = new Date();

  @OneToMany(() => Transaction, (transaction) => transaction.player)
  transactions = new Collection<Transaction>(this);
}
