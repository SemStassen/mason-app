import { Schema, ServiceMap } from "effect";
import type { Effect } from "effect";

import type { RepositoryError } from "#shared/database/index";
import { WorkspaceInvitationId } from "#shared/schemas/index";

import type { WorkspaceInvitation } from "./domain/workspace-invitation.entity";
import type {
  WorkspaceInvitationEmailMismatchError,
  WorkspaceInvitationExpiredError,
  WorkspaceInvitationNotPendingError,
} from "./domain/workspace-invitation.errors";

export class WorkspaceInvitationNotFoundError extends Schema.TaggedErrorClass<WorkspaceInvitationNotFoundError>()(
  "workspace-invitation/WorkspaceInvitationNotFoundError",
  {
    workspaceInvitationId: WorkspaceInvitationId,
  }
) {}

export interface WorkspaceInvitationModuleShape {
  readonly createOrRenewPendingWorkspaceInvitation: (params: {
    workspaceId: WorkspaceInvitation["workspaceId"];
    inviterId: WorkspaceInvitation["inviterId"];
    data: typeof WorkspaceInvitation.jsonCreate.Type;
  }) => Effect.Effect<WorkspaceInvitation, RepositoryError>;
  readonly cancelWorkspaceInvitation: (params: {
    id: WorkspaceInvitation["id"];
    workspaceId: WorkspaceInvitation["workspaceId"];
  }) => Effect.Effect<
    WorkspaceInvitation,
    | WorkspaceInvitationNotFoundError
    | WorkspaceInvitationNotPendingError
    | WorkspaceInvitationExpiredError
    | RepositoryError
  >;
  readonly acceptWorkspaceInvitation: (params: {
    id: WorkspaceInvitation["id"];
    email: WorkspaceInvitation["email"];
  }) => Effect.Effect<
    WorkspaceInvitation,
    | WorkspaceInvitationNotFoundError
    | WorkspaceInvitationNotPendingError
    | WorkspaceInvitationExpiredError
    | WorkspaceInvitationEmailMismatchError
    | RepositoryError
  >;
  readonly rejectWorkspaceInvitation: (params: {
    id: WorkspaceInvitation["id"];
    email: WorkspaceInvitation["email"];
  }) => Effect.Effect<
    WorkspaceInvitation,
    | WorkspaceInvitationNotFoundError
    | WorkspaceInvitationNotPendingError
    | WorkspaceInvitationExpiredError
    | WorkspaceInvitationEmailMismatchError
    | RepositoryError
  >;
}

export class WorkspaceInvitationModule extends ServiceMap.Service<
  WorkspaceInvitationModule,
  WorkspaceInvitationModuleShape
>()("@mason/workspace-invitation/WorkspaceInvitationModule") {}
