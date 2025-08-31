import { Data, Effect, Ref } from 'effect';

export class LedgerError extends Data.TaggedError('LedgerError')<{
  readonly cause: unknown;
}> {}

export class LedgerService extends Effect.Service<LedgerService>()(
  '@mason/LedgerService',
  {
    scoped: Effect.gen(function* () {
      const isActiveRef = yield* Ref.make(false);

      return {
        toggleIsActive: Ref.update(isActiveRef, (isActive) => !isActive),
        getIsActive: Ref.get(isActiveRef),
      };
    }),
  }
) {}
