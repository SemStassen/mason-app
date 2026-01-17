import { Context, type Effect, type Option } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/infra/db";
import type {
  Email,
  WorkspaceId,
  WorkspaceInvitationId,
} from "~/shared/schemas";
import type { AtLeastOne } from "~/shared/utils";
import type { WorkspaceInvitation } from "../domain/workspace-invitation.model";

export class WorkspaceInvitationRepository extends Context.Tag(
  "@mason/invitation/WorkspaceInvitationRepository"
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
    upsert: (params: {
      workspaceId: WorkspaceId;
      workspaceInvitations: NonEmptyReadonlyArray<WorkspaceInvitation>;
    }) => Effect.Effect<ReadonlyArray<WorkspaceInvitation>, DatabaseError>;
    retrieve: (params: {
      query: AtLeastOne<{
        id: WorkspaceInvitationId;
        workspaceId: WorkspaceId;
        status: WorkspaceInvitation["status"];
        email: Email;
        includeExpired: boolean;
      }>;
    }) => Effect.Effect<Option.Option<WorkspaceInvitation>, DatabaseError>;
    list: (params: {
      workspaceId: WorkspaceId;
      query: {
        ids?: ReadonlyArray<WorkspaceInvitationId>;
        status?: WorkspaceInvitation["status"];
        includeExpired?: boolean;
      };
    }) => Effect.Effect<ReadonlyArray<WorkspaceInvitation>, DatabaseError>;
    hardDelete: (params: {
      workspaceId: WorkspaceId;
      workspaceInvitationIds: NonEmptyReadonlyArray<WorkspaceInvitationId>;
    }) => Effect.Effect<void, DatabaseError>;
  }
>() {}
