/* oxlint-disable eslint-plugin-vitest/no-importing-vitest-globals, eslint-plugin-vitest/prefer-import-in-mock, eslint-plugin-import/no-relative-parent-imports, eslint-plugin-jest/no-untyped-mock-factory, eslint/class-methods-use-this, eslint-plugin-vitest/prefer-called-once */

import { Effect } from "effect";
import { describe, expect, it, vi } from "vitest";

import * as schema from "../src/schema";

const mockState = vi.hoisted(() => ({
  rootExecute: vi.fn(() => Promise.resolve([{ createdAt: "2026-01-01" }])),
  transactionExecute: vi.fn(() =>
    Promise.resolve([{ createdAt: "2026-01-02" }])
  ),
  transaction: vi.fn((run: (tx: unknown) => Promise<unknown>) =>
    run({
      select: () => ({
        from: () => ({
          execute: mockState.transactionExecute,
        }),
      }),
      transaction: mockState.transaction,
    })
  ),
}));

vi.mock("pg", () => ({
  Pool: class MockPool {
    end() {
      return Promise.resolve();
    }
  },
}));

vi.mock("drizzle-orm/node-postgres", () => ({
  drizzle: vi.fn(() => ({
    select: () => ({
      from: () => ({
        execute: mockState.rootExecute,
      }),
    }),
    transaction: mockState.transaction,
  })),
}));

vi.mock("../src/relations", () => ({
  relations: {} as never,
}));

describe("database layer", () => {
  it("executes effect-based callbacks through db.drizzle", async () => {
    mockState.rootExecute.mockClear();
    mockState.transactionExecute.mockClear();
    mockState.transaction.mockClear();
    process.env.DATABASE_URL = "postgres://localhost:5432/mason_test";

    const { DatabaseLayer } = await import("../src/database.layer");
    const { Database } = await import("../src/database.service");

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const db = yield* Database;

        return yield* db.drizzle((drizzle) =>
          drizzle.select().from(schema.workspacesTable).execute()
        );
      }).pipe(Effect.provide(DatabaseLayer))
    );

    expect(result).toStrictEqual([{ createdAt: "2026-01-01" }]);
    expect(mockState.rootExecute).toHaveBeenCalledOnce();
    expect(mockState.transactionExecute).not.toHaveBeenCalled();
  });

  it("executes plain drizzle queries through db.drizzle", async () => {
    mockState.rootExecute.mockClear();
    mockState.transactionExecute.mockClear();
    mockState.transaction.mockClear();
    process.env.DATABASE_URL = "postgres://localhost:5432/mason_test";

    const { DatabaseLayer } = await import("../src/database.layer");
    const { Database } = await import("../src/database.service");

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const db = yield* Database;

        return yield* db.drizzle((drizzle) =>
          Effect.tryPromise({
            try: () => drizzle.select().from(schema.workspacesTable).execute(),
            catch: (cause) => cause,
          })
        );
      }).pipe(Effect.provide(DatabaseLayer))
    );

    expect(result).toStrictEqual([{ createdAt: "2026-01-01" }]);
    expect(mockState.rootExecute).toHaveBeenCalledOnce();
    expect(mockState.transactionExecute).not.toHaveBeenCalled();
  });

  it("uses the transaction connection for db.drizzle inside withTransaction", async () => {
    mockState.rootExecute.mockClear();
    mockState.transactionExecute.mockClear();
    mockState.transaction.mockClear();
    process.env.DATABASE_URL = "postgres://localhost:5432/mason_test";

    const { DatabaseLayer } = await import("../src/database.layer");
    const { Database } = await import("../src/database.service");

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const db = yield* Database;

        return yield* db.withTransaction(
          db.drizzle((drizzle) =>
            drizzle.select().from(schema.workspacesTable).execute()
          )
        );
      }).pipe(Effect.provide(DatabaseLayer))
    );

    expect(result).toStrictEqual([{ createdAt: "2026-01-02" }]);
    expect(mockState.transaction).toHaveBeenCalledOnce();
    expect(mockState.transactionExecute).toHaveBeenCalledOnce();
    expect(mockState.rootExecute).not.toHaveBeenCalled();
  });

  it("keeps unsafeDrizzle bound to the root connection", async () => {
    mockState.rootExecute.mockClear();
    mockState.transactionExecute.mockClear();
    mockState.transaction.mockClear();
    process.env.DATABASE_URL = "postgres://localhost:5432/mason_test";

    const { DatabaseLayer } = await import("../src/database.layer");
    const { Database } = await import("../src/database.service");

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const db = yield* Database;

        return yield* db.withTransaction(
          Effect.tryPromise({
            try: () =>
              db.unsafeDrizzle.select().from(schema.workspacesTable).execute(),
            catch: (cause) => cause,
          })
        );
      }).pipe(Effect.provide(DatabaseLayer))
    );

    expect(result).toStrictEqual([{ createdAt: "2026-01-01" }]);
    expect(mockState.transaction).toHaveBeenCalledOnce();
    expect(mockState.rootExecute).toHaveBeenCalledOnce();
    expect(mockState.transactionExecute).not.toHaveBeenCalled();
  });
});
