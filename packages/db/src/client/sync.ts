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
    primaryKey: ["id"],
    shapeKey: "workspaces",
  });

  await pg.sync.syncShapeToTable({
    shape: {
      url: clientEnv.VITE_ELECTRIC_URL,
      params: {
        table: "users",
      },
    },
    table: "users",
    primaryKey: ["id"],
    shapeKey: "users",
  });

  await pg.sync.syncShapeToTable({
    shape: {
      url: clientEnv.VITE_ELECTRIC_URL,
      params: {
        table: "members",
      },
    },
    table: "members",
    primaryKey: ["id"],
    shapeKey: "members",
  });

  await pg.sync.syncShapeToTable({
    shape: {
      url: clientEnv.VITE_ELECTRIC_URL,
      params: {
        table: "projects",
      },
    },
    table: "projects",
    primaryKey: ["id"],
    shapeKey: "projects",
  });

  await pg.sync.syncShapeToTable({
    shape: {
      url: clientEnv.VITE_ELECTRIC_URL,
      params: {
        table: "activities",
      },
    },
    table: "activities",
    primaryKey: ["id"],
    shapeKey: "activities",
  });

  await pg.sync.syncShapeToTable({
    shape: {
      url: clientEnv.VITE_ELECTRIC_URL,
      params: {
        table: "time_entries",
      },
    },
    table: "time_entries",
    primaryKey: ["id"],
    shapeKey: "time_entries",
  });
}
