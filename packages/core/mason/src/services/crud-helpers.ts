import { Effect, Either } from "effect";

export const createDomainEntities: <
  TInput,
  TDbRecord,
  TDomainEntity,
  TDbError extends Error,
  TValidationError extends Error,
>(input: {
  entityName: string;
  inputs: Array<TInput>;
  toDomain: (
    input: TInput
  ) => Effect.Effect<TDomainEntity, TValidationError, never>;
  saveBatch: (
    entities: Array<TDomainEntity>
  ) => Effect.Effect<Array<TDbRecord>, TDbError, never>;
  fromDb: (
    record: TDbRecord
  ) => Effect.Effect<TDomainEntity, TValidationError, never>;
}) => Effect.Effect<Array<TDomainEntity>, TDbError | TValidationError, never> =
  ({ entityName, inputs, toDomain, saveBatch, fromDb }) =>
    Effect.gen(function* () {
      if (!inputs.length) {
        yield* Effect.logDebug(
          `createDomainEntities: 0 supplied for ${entityName}`
        );
        return [];
      }

      const domainEntities = yield* Effect.all(inputs.map(toDomain));
      const persisted = yield* saveBatch(domainEntities);

      return yield* Effect.all(persisted.map(fromDb));
    });

export const updateDomainEntities: <
  TInput extends { id: string },
  TDbRecord extends { id: string },
  TDomainEntity,
  TDbError extends Error,
  TValidationError extends Error,
>(input: {
  entityName: string;
  inputs: Array<TInput>;
  fetchExisting: (
    ids: Array<TInput["id"]>
  ) => Effect.Effect<Array<TDbRecord>, TDbError, never>;
  toDomain: (
    update: TInput,
    existing: TDbRecord
  ) => Effect.Effect<TDomainEntity, TValidationError, never>;
  saveUpdates: (
    entities: Array<TDomainEntity>
  ) => Effect.Effect<Array<TDbRecord>, TDbError, never>;
  fromDb: (
    record: TDbRecord
  ) => Effect.Effect<TDomainEntity, TValidationError, never>;
}) => Effect.Effect<Array<TDomainEntity>, TDbError | TValidationError, never> =
  ({ entityName, inputs, fetchExisting, toDomain, saveUpdates, fromDb }) =>
    Effect.gen(function* () {
      if (!inputs.length) {
        yield* Effect.logDebug(
          `updateDomainEntities: 0 supplied for ${entityName}`
        );
        return [];
      }

      const ids = inputs.map((i) => i.id);

      const existingRecords = yield* fetchExisting(ids);

      const toUpdate = yield* Effect.partition(existingRecords, (existing) => {
        const updateData = inputs.find((i) => i.id === existing.id);
        return updateData
          ? Either.left(toDomain(updateData, existing))
          : Either.right(existing);
      }).pipe(
        Effect.tap(([_, missing]) => {
          if (missing.length > 0) {
            return Effect.logError({
              msg: `updateDomainEntities: ${entityName} not found`,
              missingIds: missing.map((m) => m.id),
            });
          }
          return Effect.void;
        }),
        Effect.flatMap(([existing]) => Effect.all(existing))
      );

      const updatedRecords = yield* saveUpdates(toUpdate);

      return yield* Effect.all(updatedRecords.map(fromDb));
    });
