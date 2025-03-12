import { drizzle } from "drizzle-orm/postgres-js";
import { reset, seed } from "drizzle-seed";
import * as schema from "./src/schema";

async function main() {
  const db = drizzle({
    connection: {
      url: "postgres://electric_user:password@localhost:5442/electric",
    },
  });

  await reset(db, schema);

  await seed(db, schema).refine((f) => ({
    organizationsTable: {
      count: 1,
      columns: {
        name: f.companyName(),
      },
    },
    workspacesTable: {
      count: 3,
      columns: {
        name: f.jobTitle(),
      },
    },
    usersTable: {
      count: 20,
      columns: {
        name: f.fullName(),
        displayName: f.fullName(),
      },
    },
    usersToWorkspacesTable: {
      count: 10,
    },
    timeEntriesTable: {
      count: 200,
      columns: {
        startedAt: f.timestamp(),
      },
    },
  }));
}

main();
