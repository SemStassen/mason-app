import { PGlite } from '@electric-sql/pglite';
import { worker } from '@electric-sql/pglite/worker';

// Also see: https://pglite.dev/docs/multi-tab-worker
worker({
  // biome-ignore lint/suspicious/useAwait: Needed by docs
  async init(options) {
    // const meta = options.meta;

    const pg = new PGlite(options);
    return pg;
  },
});
