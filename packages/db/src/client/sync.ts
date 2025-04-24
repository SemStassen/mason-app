import { clientEnv } from "@mason/env/client";
import type { PGliteWithExtensions } from "./db";

export async function sync(pg: PGliteWithExtensions) {
  await pg.sync.syncShapeToTable({
    shape: {
      url: clientEnv.VITE_ELECTRIC_URL,
      params: {
        table: "workspaces",
      },
    },
    table: "workspaces",
    primaryKey: ["uuid"],
    shapeKey: "workspaces",
    useCopy: true,
  });

  await pg.sync.syncShapeToTable({
    shape: {
      url: clientEnv.VITE_ELECTRIC_URL,
      params: {
        table: "users",
      },
    },
    table: "users",
    primaryKey: ["uuid"],
    shapeKey: "users",
    useCopy: true,
  });

  await pg.sync.syncShapeToTable({
    shape: {
      url: clientEnv.VITE_ELECTRIC_URL,
      params: {
        table: "projects",
      },
    },
    table: "projects",
    primaryKey: ["uuid"],
    shapeKey: "projects",
    useCopy: true,
  });

  await pg.sync.syncShapeToTable({
    shape: {
      url: clientEnv.VITE_ELECTRIC_URL,
      params: {
        table: "activities",
      },
    },
    table: "activities",
    primaryKey: ["uuid"],
    shapeKey: "activities",
    useCopy: true,
  });

  await pg.sync.syncShapeToTable({
    shape: {
      url: clientEnv.VITE_ELECTRIC_URL,
      params: {
        table: "time_entries",
      },
    },
    table: "time_entries",
    primaryKey: ["uuid"],
    shapeKey: "time_entries",
    useCopy: true,
  });
}
