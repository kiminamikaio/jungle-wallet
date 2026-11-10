import 'dotenv/config';
import { Migrator } from '@mikro-orm/migrations';
import { defineConfig } from '@mikro-orm/postgresql';
import { Player } from '../domain/player.entity';
import { Transaction } from '../domain/transaction.entity';

const config = defineConfig({
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  user: process.env.POSTGRES_USER ?? 'wallet',
  password: process.env.POSTGRES_PASSWORD ?? 'wallet',
  dbName: process.env.POSTGRES_DB ?? 'wallet',
  entities: [Player, Transaction],
  extensions: [Migrator],
  migrations: {
    path: './dist/wallet/migrations',
    pathTs: './src/wallet/migrations',
  },
});

export default config;
