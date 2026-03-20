import type { RepositoryError } from "@mason/core/shared/repository";
import type { DatabaseError } from "@mason/db";
import { Effect } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

export function mapInfraErrors<A, E, R>(): (
  self: Effect.Effect<A, E, R>
) => Effect.Effect<
  A,
  | Exclude<E, RepositoryError | DatabaseError>
  | HttpApiError.InternalServerError,
  R
> {
  return Effect.catchTags({
    "infra/DatabaseError": () =>
      Effect.fail(new HttpApiError.InternalServerError()),
    RepositoryError: () => Effect.fail(new HttpApiError.InternalServerError()),
  }) as (
    self: Effect.Effect<A, E, R>
  ) => Effect.Effect<
    A,
    | Exclude<E, RepositoryError | DatabaseError>
    | HttpApiError.InternalServerError,
    R
  >;
}
