import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/core/db/schema.ts',
  dialect: 'postgresql',
  out: './src/core/db/migrations',
});
