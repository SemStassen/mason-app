import { PGlite } from "@electric-sql/pglite";
import { worker } from "@electric-sql/pglite/worker";

// import { migrate } from "./migrate";

// See: https://pglite.dev/docs/multi-tab-worker
worker({
  async init(options) {
    const { meta } = options;

    const pg = new PGlite(options);

    // await migrate(pg);

    return pg;
  },
});
