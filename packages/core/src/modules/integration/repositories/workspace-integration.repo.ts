import { Context, type Effect, type Option } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/infra/db";
import type { WorkspaceId, WorkspaceIntegrationId } from "~/shared/schemas";
import type { AtLeastOne } from "~/shared/utils";
import type { WorkspaceIntegration } from "../domain";

export class WorkspaceIntegrationRepository extends Context.Tag(
  "@mason/integration/WorkspaceIntegrationRepository"
)<
  WorkspaceIntegrationRepository,
  {
    insert: (params: {
      workspaceIntegrations: NonEmptyReadonlyArray<WorkspaceIntegration>;
    }) => Effect.Effect<ReadonlyArray<WorkspaceIntegration>, DatabaseError>;
    update: (params: {
      workspaceId: WorkspaceId;
      workspaceIntegrations: NonEmptyReadonlyArray<WorkspaceIntegration>;
    }) => Effect.Effect<ReadonlyArray<WorkspaceIntegration>, DatabaseError>;
    retrieve: (params: {
      workspaceId: WorkspaceId;
      query: AtLeastOne<{
        id: WorkspaceIntegrationId;
        provider: WorkspaceIntegration["provider"];
      }>;
    }) => Effect.Effect<Option.Option<WorkspaceIntegration>, DatabaseError>;
    list: (params: {
      workspaceId: WorkspaceId;
      query: {
        ids?: ReadonlyArray<WorkspaceIntegrationId>;
      };
    }) => Effect.Effect<ReadonlyArray<WorkspaceIntegration>, DatabaseError>;
    hardDelete: (params: {
      workspaceId: WorkspaceId;
      ids: NonEmptyReadonlyArray<WorkspaceIntegrationId>;
    }) => Effect.Effect<void, DatabaseError>;
  }
>() {}
