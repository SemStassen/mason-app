import { Effect } from "effect";

export const assert = <E>(
  condition: boolean,
  error: E
): Effect.Effect<void, E> => (condition ? Effect.void : Effect.fail(error));

export const assertEffect = <E>(
  condition: Effect.Effect<boolean, E>,
  error: E
): Effect.Effect<void, E> =>
  condition.pipe(Effect.flatMap((result) => assert(result, error)));
