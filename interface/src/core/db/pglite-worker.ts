import { PGlite } from "@electric-sql/pglite";
import { worker } from "@electric-sql/pglite/worker";
import { migrate } from "./migrate";

// Also see: https://pglite.dev/docs/multi-tab-worker
worker({
  async init(options) {
    // const meta = options.meta;

    const pg = new PGlite(options);

    await migrate(pg);

    return pg;
  },
});
