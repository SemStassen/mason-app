import { Context, type Effect, type Option } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/shared/errors";
import type { WorkspaceId, WorkspaceInvitationId } from "~/shared/schemas";
import type {
  WorkspaceInvitation,
  WorkspaceInvitationStatus,
} from "../schemas/workspace-invitation.model";

export class WorkspaceInvitationRepository extends Context.Tag(
  "@mason/workspace-invitation/WorkspaceInvitationRepository"
)<
  WorkspaceInvitationRepository,
  {
    insert: (params: {
      workspaceInvitations: NonEmptyReadonlyArray<WorkspaceInvitation>;
    }) => Effect.Effect<ReadonlyArray<WorkspaceInvitation>, DatabaseError>;
    update: (params: {
      workspaceId: WorkspaceId;
      workspaceInvitations: NonEmptyReadonlyArray<WorkspaceInvitation>;
    }) => Effect.Effect<ReadonlyArray<WorkspaceInvitation>, DatabaseError>;
    hardDelete: (params: {
      workspaceId: WorkspaceId;
      workspaceInvitationIds: NonEmptyReadonlyArray<WorkspaceInvitationId>;
    }) => Effect.Effect<void, DatabaseError>;
    retrieve: (params: {
      workspaceId: WorkspaceId;
      workspaceInvitationId: WorkspaceInvitationId;
    }) => Effect.Effect<Option.Option<WorkspaceInvitation>, DatabaseError>;
    list: (params: {
      workspaceId: WorkspaceId;
      query: {
        ids?: ReadonlyArray<WorkspaceInvitationId>;
        status?: WorkspaceInvitationStatus;
      };
    }) => Effect.Effect<ReadonlyArray<WorkspaceInvitation>, DatabaseError>;
  }
>() {}
