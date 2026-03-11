import { Effect, Layer } from "effect";
import { Email } from "~/shared/email";

export const EmailLayer = Layer.effect(
	Email,
	Effect.gen(function* () {
		return {
			sendWorkspaceInvitation: Effect.fn("email/sendWorkspaceInvitation")(
				function* (params) {
					return yield* Effect.succeed(undefined);
				},
			),
		};
	}),
);
