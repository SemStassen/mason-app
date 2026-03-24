import type { PGliteInterfaceExtensions } from "@electric-sql/pglite";
import { makePGliteProvider } from "@electric-sql/pglite-react";
import { electricSync } from "@electric-sql/pglite-sync";
import { live } from "@electric-sql/pglite/live";
import { PGliteWorker } from "@electric-sql/pglite/worker";

export const { PGliteProvider, usePGlite } = makePGliteProvider<
  PGliteWorker &
    PGliteInterfaceExtensions<{
      live: typeof live;
    }>
>();

export const db = new PGliteWorker(
  new Worker(new URL("pglite-worker.js", import.meta.url), {
    type: "module",
  }),
  {
    meta: {
      workspaceMemberId: "default",
    },
    relaxedDurability: true,
    extensions: {
      electric: electricSync(),
      live: live,
    },
  }
);
