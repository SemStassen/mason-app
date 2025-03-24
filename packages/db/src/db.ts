import type { PGliteInterfaceExtensions } from "@electric-sql/pglite";
import {
  makePGliteProvider,
  useLiveIncrementalQuery,
} from "@electric-sql/pglite-react";
import { electricSync } from "@electric-sql/pglite-sync";
import { live } from "@electric-sql/pglite/live";
import type { vector } from "@electric-sql/pglite/vector";
import { PGliteWorker } from "@electric-sql/pglite/worker";
import { migrate } from "./migrations";
import PGWorker from "./pglite-worker.ts?worker";

export type { LiveQuery } from "@electric-sql/pglite/live";

export type PGliteWithExtensions = PGliteWorker &
  PGliteInterfaceExtensions<{
    live: typeof live;
    vector: typeof vector;
    sync: ReturnType<typeof electricSync>;
    // fuzzystrmatch: typeof fuzzystrmatch;
  }>;

export const { PGliteProvider, usePGlite } =
  makePGliteProvider<PGliteWithExtensions>();

export async function createPGlite() {
  const pg = (await PGliteWorker.create(new PGWorker(), {
    id: "mason",
    dataDir: "idb://mason",
    extensions: {
      live: live,
      sync: electricSync(),
      // fuzzystrmatch: fuzzystrmatch,
    },
  })) as PGliteWithExtensions;

  // Migrate the database to the latest schema
  await migrate(pg);

  return pg;
}

export { useLiveIncrementalQuery };
