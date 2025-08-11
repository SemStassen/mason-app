import { createEnv } from '@t3-oss/env-core';
import z from 'zod';

export const serverEnv = createEnv({
  clientPrefix: 'VITE_',
  client: {},
  server: {
    DATABASE_URL: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
