import { Context, type Effect, type Option } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/shared/errors";
import type { WorkspaceId, WorkspaceIntegrationId } from "~/shared/schemas";
import type { WorkspaceIntegration } from "../schemas/workspace-integration.model";

export class WorkspaceIntegrationRepository extends Context.Tag(
  "@mason/integration/WorkspaceIntegrationRepository"
)<
  WorkspaceIntegrationRepository,
  {
    insert: (params: {
      workspaceId: WorkspaceId;
      workspaceIntegrations: NonEmptyReadonlyArray<WorkspaceIntegration>;
    }) => Effect.Effect<ReadonlyArray<WorkspaceIntegration>, DatabaseError>;
    update: (params: {
      workspaceId: WorkspaceId;
      workspaceIntegrations: NonEmptyReadonlyArray<WorkspaceIntegration>;
    }) => Effect.Effect<ReadonlyArray<WorkspaceIntegration>, DatabaseError>;
    hardDelete: (params: {
      workspaceId: WorkspaceId;
      workspaceIntegrationsIds: NonEmptyReadonlyArray<WorkspaceIntegrationId>;
    }) => Effect.Effect<void, DatabaseError>;
    retrieve: (params: {
      workspaceId: WorkspaceId;
      query: {
        id?: WorkspaceIntegrationId;
        kind?: "float";
      };
    }) => Effect.Effect<Option.Option<WorkspaceIntegration>, DatabaseError>;
    list: (params: {
      workspaceId: WorkspaceId;
      query: {
        ids?: ReadonlyArray<WorkspaceIntegrationId>;
      };
    }) => Effect.Effect<ReadonlyArray<WorkspaceIntegration>, DatabaseError>;
  }
>() {}
