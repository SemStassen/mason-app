import type { PGliteWithExtensions } from "./db";

const ELECTRIC_URL = "http://localhost:4027/v1/shape";

export async function sync(pg: PGliteWithExtensions) {
  await pg.sync.syncShapeToTable({
    shape: {
      url: ELECTRIC_URL,
      params: {
        table: "organizations",
      },
    },
    table: "organizations",
    primaryKey: ["uuid"],
    shapeKey: "organizations",
    commitGranularity: "up-to-date",
    useCopy: true,
  });

  await pg.sync.syncShapeToTable({
    shape: {
      url: ELECTRIC_URL,
      params: {
        table: "workspaces",
      },
    },
    table: "workspaces",
    primaryKey: ["uuid"],
    shapeKey: "workspaces",
    commitGranularity: "up-to-date",
    useCopy: true,
  });

  await pg.sync.syncShapeToTable({
    shape: {
      url: ELECTRIC_URL,
      params: {
        table: "users",
      },
    },
    table: "users",
    primaryKey: ["uuid"],
    shapeKey: "users",
    commitGranularity: "up-to-date",
    useCopy: true,
  });

  await pg.sync.syncShapeToTable({
    shape: {
      url: ELECTRIC_URL,
      params: {
        table: "time_entries",
      },
    },
    table: "time_entries",
    primaryKey: ["uuid"],
    shapeKey: "time_entries",
    commitGranularity: "up-to-date",
    useCopy: true,
  });

  await pg.sync.syncShapeToTable({
    shape: {
      url: ELECTRIC_URL,
      params: {
        table: "users_to_workspaces",
      },
    },
    table: "users_to_workspaces",
    primaryKey: ["uuid"],
    shapeKey: "users_to_workspaces",
    commitGranularity: "up-to-date",
    useCopy: true,
  });
}
