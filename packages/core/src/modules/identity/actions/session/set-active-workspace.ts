import { Effect, Option } from "effect";
import type { SessionId } from "~/shared/schemas";
import type { Session } from "../../domain/session.model";
import { SessionNotFoundError } from "../../errors";
import { SessionRepository } from "../../repositories/session.repo";

export interface SetActiveWorkspaceInput {
  sessionId: SessionId;
  workspaceId: Session["activeWorkspaceId"];
}
export type SetActiveWorkspaceOutput = void;

export const SetActiveWorkspaceAction = Effect.fn(
  "identity/SetActiveWorkspaceAction"
)(function* (input: SetActiveWorkspaceInput) {
  const sessionRepo = yield* SessionRepository;

  const session = yield* sessionRepo
    .retrieve({
      query: { id: input.sessionId },
    })
    .pipe(Effect.map(Option.getOrThrowWith(() => new SessionNotFoundError())));

  const updatedSession = yield* session.setActiveWorkspace(input.workspaceId);

  yield* sessionRepo.update({ sessions: [updatedSession] });
});
