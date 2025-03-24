import type { PGliteWithExtensions } from "./db";

const ELECTRIC_URL = "http://localhost:4027/v1/shape";

export async function sync(pg: PGliteWithExtensions) {
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
    useCopy: true,
  });

  await pg.sync.syncShapeToTable({
    shape: {
      url: ELECTRIC_URL,
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
      url: ELECTRIC_URL,
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
      url: ELECTRIC_URL,
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
