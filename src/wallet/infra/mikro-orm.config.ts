import 'dotenv/config';
import { defineConfig } from '@mikro-orm/postgresql';

const config = defineConfig({
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  user: process.env.POSTGRES_USER ?? 'wallet',
  password: process.env.POSTGRES_PASSWORD ?? 'wallet',
  dbName: process.env.POSTGRES_DB ?? 'wallet',
  entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],
  migrations: {
    path: './dist/wallet/migrations',
    pathTs: './src/wallet/migrations',
  },
});

export default config;
