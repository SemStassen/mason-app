import { PGlite } from "@electric-sql/pglite";
import { worker } from "@electric-sql/pglite/worker";

void worker({
  async init(options) {
    const pg = await PGlite.create({
      dataDir: options.dataDir,
      relaxedDurability: true,
    });

    return pg;
  },
});
