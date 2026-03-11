import {
  AcceptWorkspaceInvitationFlow,
  CancelWorkspaceInvitationFlow,
  CreateWorkspaceInvitationFlow,
  RejectWorkspaceInvitationFlow,
  WorkspaceInvitationRpcs,
} from "@mason/core";
import { Effect } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

export const WorkspaceInvitationRpcsLive = WorkspaceInvitationRpcs.toLayer({
  "WorkspaceInvitation.Create": (request) =>
    CreateWorkspaceInvitationFlow(request).pipe(
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
  "WorkspaceInvitation.Cancel": (request) =>
    CancelWorkspaceInvitationFlow(request).pipe(
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
  "WorkspaceInvitation.Accept": (request) =>
    AcceptWorkspaceInvitationFlow(request).pipe(
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
  "WorkspaceInvitation.Reject": (request) =>
    RejectWorkspaceInvitationFlow(request).pipe(
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
});
