import { DateTime, Effect, Option } from "effect";

type ValidateFn<T, E> = (input: T) => Effect.Effect<T, E>;

interface SoftDeletable {
  readonly deletedAt: Option.Option<DateTime.Utc>;
}

interface Archivable {
  readonly archivedAt: Option.Option<DateTime.Utc>;
}

export const isDeleted = <T extends SoftDeletable>(self: T): boolean =>
  Option.isSome(self.deletedAt);

export const isArchived = <T extends Archivable>(self: T): boolean =>
  Option.isSome(self.archivedAt);

export const softDelete = <T extends SoftDeletable, E>(
  self: T,
  validate: ValidateFn<T, E>
): Effect.Effect<T, E> =>
  isDeleted(self)
    ? Effect.succeed(self)
    : Effect.gen(function* () {
        const deletedAt = yield* DateTime.now;
        return yield* validate({ ...self, deletedAt: Option.some(deletedAt) });
      });

export const restore = <T extends SoftDeletable, E>(
  self: T,
  validate: ValidateFn<T, E>
): Effect.Effect<T, E> => validate({ ...self, deletedAt: Option.none() });

export const archive = <T extends Archivable, E>(
  self: T,
  validate: ValidateFn<T, E>
): Effect.Effect<T, E> =>
  isArchived(self)
    ? Effect.succeed(self)
    : Effect.gen(function* () {
        const archivedAt = yield* DateTime.now;
        return yield* validate({
          ...self,
          archivedAt: Option.some(archivedAt),
        });
      });

export const unarchive = <T extends Archivable, E>(
  self: T,
  validate: ValidateFn<T, E>
): Effect.Effect<T, E> => validate({ ...self, archivedAt: Option.none() });
