import { InternalServerError } from "@effect/platform/HttpApiError";
import {
  AcceptWorkspaceInvitationFlow,
  CancelWorkspaceInvitationFlow,
  CreateWorkspaceInvitationFlow,
  RejectWorkspaceInvitationFlow,
  WorkspaceInvitationRpcs,
} from "@mason/core";
import { Effect, pipe } from "effect";

export const WorkspaceInvitationRpcsLive = WorkspaceInvitationRpcs.toLayer({
  "WorkspaceInvitation.Create": (request) =>
    pipe(
      CreateWorkspaceInvitationFlow(request),
      Effect.catchTags({
        "shared/MasonError": () => new InternalServerError(),
        "invitation/WorkspaceInvitationExpiredError": () =>
          new InternalServerError(),
      })
    ),
  "WorkspaceInvitation.Cancel": (request) =>
    pipe(
      CancelWorkspaceInvitationFlow(request),
      Effect.catchTags({
        "shared/MasonError": () => new InternalServerError(),
        "invitation/WorkspaceInvitationExpiredError": () =>
          new InternalServerError(),
      })
    ),
  "WorkspaceInvitation.Accept": (request) =>
    pipe(
      AcceptWorkspaceInvitationFlow(request),
      Effect.catchTags({
        "shared/MasonError": () => new InternalServerError(),
        "identity/SessionNotFoundError": () => new InternalServerError(),
        "infra/DatabaseError": () => new InternalServerError(),
      })
    ),
  "WorkspaceInvitation.Reject": (request) =>
    pipe(
      RejectWorkspaceInvitationFlow(request),
      Effect.catchTags({
        "shared/MasonError": () => new InternalServerError(),
      })
    ),
});
