import {
  Data,
  Duration,
  Effect,
  Fiber,
  Match,
  Ref,
  Schedule,
  Stream,
  SubscriptionRef,
} from "effect";
import { PLATFORM } from "~/utils/constants";

export class LedgerError extends Data.TaggedError("LedgerError")<{
  readonly cause: unknown;
}> {}

export class LedgerService extends Effect.Service<LedgerService>()(
  "@mason/interface/LedgerService",
  {
    scoped: Effect.gen(function* () {
      const isActiveRef = yield* SubscriptionRef.make(false);

      const pollSnapshot = Match.value(PLATFORM).pipe(
        Match.when({ platform: "desktop" }, (platform) => 
          Effect.promise(() => platform.captureWindowActivity()).pipe(
            Effect.tap((snapshot) => Effect.log("Logging Ledger", snapshot))
          )
        ),
        Match.orElse(() => Effect.logDebug("Desktop platform not detected, skipping polling")),
        Effect.catchAll(() => Effect.void),
        Effect.repeat(Schedule.spaced(Duration.seconds(10)))
      )

      const pollingFiberRef = yield* Ref.make<Fiber.RuntimeFiber<
        number,
        never
      > | null>(null);

      yield* isActiveRef.changes.pipe(
        Stream.runForEach((active) =>
          active
            ? Ref.get(pollingFiberRef).pipe(
                Effect.flatMap((existing) =>
                  existing
                    ? Effect.void
                    : Effect.forkScoped(pollSnapshot).pipe(
                        Effect.tap((fiber) => Ref.set(pollingFiberRef, fiber)),
                        Effect.asVoid
                      )
                )
              )
            : Ref.get(pollingFiberRef).pipe(
                Effect.flatMap((existing) =>
                  existing
                    ? Fiber.interrupt(existing).pipe(
                        Effect.zipRight(Ref.set(pollingFiberRef, null))
                      )
                    : Effect.void
                )
              )
        ),
        Effect.forkScoped
      );

      return {
        // expose the SubscriptionRef so UI can subscribe reactively
        isActiveRef: isActiveRef,
        toggleIsActive: SubscriptionRef.update(
          isActiveRef,
          (isActive) => !isActive
        ),
      } as const;
    }),
  }
) {}
