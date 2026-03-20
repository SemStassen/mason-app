/* oxlint-disable eslint-plugin-vitest/no-importing-vitest-globals, eslint-plugin-vitest/prefer-import-in-mock, eslint-plugin-jest/no-untyped-mock-factory */

import { Effect } from "effect";
import { describe, expect, it, vi } from "vitest";

import { DatabaseLayer } from "../src/database.layer";
import { Database } from "../src/database.service";

interface MockDrizzle {
  readonly label: string;
  readonly transaction: <A, E, R>(
    f: (transaction: MockDrizzle) => Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E, R>;
}

const mockState = vi.hoisted(() => ({
  baseDrizzle: null as MockDrizzle | null,
}));

const createMockDrizzle = (label: string): MockDrizzle => ({
  label,
  transaction: (f) => Effect.suspend(() => f(createMockDrizzle(`${label}.tx`))),
});

const getLabel = (value: unknown) => (value as MockDrizzle).label;

vi.mock("drizzle-orm/effect-postgres", async () => {
  const EffectModule = await import("effect/Effect");
  const LayerModule = await import("effect/Layer");

  return {
    make: vi.fn(() => EffectModule.succeed(mockState.baseDrizzle as never)),
    DefaultServices: LayerModule.empty as never,
  };
});

vi.mock("./relations", () => ({
  relations: {} as never,
}));

describe("database layer", () => {
  it("uses active transaction drizzle for nested transactions", async () => {
    mockState.baseDrizzle = createMockDrizzle("base");

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const db = yield* Database;

        const outside = yield* db.drizzle((drizzle) =>
          Effect.succeed(getLabel(drizzle))
        );

        const nested = yield* db.withTransaction(
          Effect.gen(function* () {
            const inTransaction = yield* Database;

            const inside = yield* inTransaction.drizzle((drizzle) =>
              Effect.succeed(getLabel(drizzle))
            );

            const insideNested = yield* inTransaction.withTransaction(
              Effect.gen(function* () {
                const nestedTransaction = yield* Database;
                return yield* nestedTransaction.drizzle((drizzle) =>
                  Effect.succeed(getLabel(drizzle))
                );
              })
            );

            return {
              inside,
              insideNested,
              unsafeInside: getLabel(inTransaction.unsafeDrizzle),
            };
          })
        );

        return {
          outside,
          unsafeOutside: getLabel(db.unsafeDrizzle),
          ...nested,
        };
      }).pipe(Effect.provide(DatabaseLayer))
    );

    expect(result).toStrictEqual({
      outside: "base",
      inside: "base.tx",
      insideNested: "base.tx.tx",
      unsafeOutside: "base",
      unsafeInside: "base",
    });
  });
});
