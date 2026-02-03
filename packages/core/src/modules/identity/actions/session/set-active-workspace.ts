import { Effect, Option } from "effect";
import type { SessionId } from "~/shared/schemas";
import type { Session } from "../../domain/session.model";
import { SessionNotFoundError } from "../../errors";
import { SessionRepository } from "../../repositories/session.repo";

export interface SetActiveWorkspaceInput {
  sessionId: SessionId;
  workspaceId: Session["activeWorkspaceId"];
}
export type SetActiveWorkspaceOutput = typeof Session.entity.Type;

export const SetActiveWorkspaceAction = Effect.fn(
  "identity/SetActiveWorkspaceAction"
)(function* (input: SetActiveWorkspaceInput) {
  const sessionRepo = yield* SessionRepository;

  const session = yield* sessionRepo
    .retrieve({
      query: { id: input.sessionId },
    })
    .pipe(
      Effect.map(
        Option.getOrThrowWith(
          () => new SessionNotFoundError({ id: input.sessionId })
        )
      )
    );

  const updatedSession = yield* session.setActiveWorkspace(input.workspaceId);

  const [persistedSession] = yield* sessionRepo.update({
    sessions: [updatedSession],
  });

  return persistedSession;
});
