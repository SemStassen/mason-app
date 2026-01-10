import { Context, type Effect, type Option } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/shared/errors";
import type {
  Email,
  WorkspaceId,
  WorkspaceInvitationId,
} from "~/shared/schemas";
import type {
  WorkspaceInvitation,
  WorkspaceInvitationStatus,
} from "../schemas/workspace-invitation.model";

export class WorkspaceInvitationRepository extends Context.Tag(
  "@mason/invitation/WorkspaceInvitationRepository"
)<
  WorkspaceInvitationRepository,
  {
    upsert: (params: {
      workspaceId: WorkspaceId;
      workspaceInvitations: NonEmptyReadonlyArray<WorkspaceInvitation>;
    }) => Effect.Effect<ReadonlyArray<WorkspaceInvitation>, DatabaseError>;
    hardDelete: (params: {
      workspaceId: WorkspaceId;
      workspaceInvitationIds: NonEmptyReadonlyArray<WorkspaceInvitationId>;
    }) => Effect.Effect<void, DatabaseError>;
    retrieve: (params: {
      workspaceId: WorkspaceId;
      query?: {
        id?: WorkspaceInvitationId;
        status?: WorkspaceInvitationStatus;
        email?: Email;
      };
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
