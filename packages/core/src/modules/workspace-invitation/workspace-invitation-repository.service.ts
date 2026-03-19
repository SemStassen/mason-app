import { ServiceMap } from "effect";
import type { Effect, Option } from "effect";

import type { RepositoryError } from "#shared/database/index";

import type { WorkspaceInvitation } from "./domain/workspace-invitation.entity";

export interface WorkspaceInvitationRepositoryShape {
  readonly insert: (
    data: typeof WorkspaceInvitation.insert.Type
  ) => Effect.Effect<WorkspaceInvitation, RepositoryError>;
  readonly update: (params: {
    workspaceId: WorkspaceInvitation["workspaceId"];
    id: WorkspaceInvitation["id"];
    update: typeof WorkspaceInvitation.update.Type;
  }) => Effect.Effect<WorkspaceInvitation, RepositoryError>;
  readonly findById: (params: {
    workspaceId: WorkspaceInvitation["workspaceId"];
    id: WorkspaceInvitation["id"];
  }) => Effect.Effect<Option.Option<WorkspaceInvitation>, RepositoryError>;
  readonly findByInvitationId: (
    id: WorkspaceInvitation["id"]
  ) => Effect.Effect<Option.Option<WorkspaceInvitation>, RepositoryError>;
  readonly findActivePendingByEmail: (params: {
    workspaceId: WorkspaceInvitation["workspaceId"];
    email: WorkspaceInvitation["email"];
  }) => Effect.Effect<Option.Option<WorkspaceInvitation>, RepositoryError>;
}

export class WorkspaceInvitationRepository extends ServiceMap.Service<
  WorkspaceInvitationRepository,
  WorkspaceInvitationRepositoryShape
>()("@mason/workspace-invitation/WorkspaceInvitationRepository") {}
