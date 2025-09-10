import type { PGliteInterfaceExtensions } from '@electric-sql/pglite';
import { live } from '@electric-sql/pglite/live';
import { PGliteWorker } from '@electric-sql/pglite/worker';
import { makePGliteProvider } from '@electric-sql/pglite-react';

export const { PGliteProvider, usePGlite } = makePGliteProvider<
  PGliteWorker &
    PGliteInterfaceExtensions<{
      live: typeof live;
    }>
>();

export const db = await PGliteWorker.create(
  new Worker(new URL('./pglite-worker.js', import.meta.url), {
    type: 'module',
  }),
  {
    dataDir: 'idb://mason',
    relaxedDurability: true,
    extensions: {
      live: live,
    },
  }
);
