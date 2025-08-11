import { serverEnv } from '@mason/env/server';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema.ts',
  dialect: 'postgresql',
  out: 'migrations',
  dbCredentials: {
    url: serverEnv.DATABASE_URL,
  },
});
