import type { WorkspaceId } from "@mason/core/models/ids";
import type { ExternalProject } from "@mason/core/models/project.model";
import type { ExternalTask } from "@mason/core/models/task.model";
import { Context, type Effect } from "effect";
import type { IntegrationAdapterError } from "./errors";

export class InternalTimeTrackingIntegrationAdapter extends Context.Tag(
  "@mason/integrations/TimeTrackingAdapter",
)<
  InternalTimeTrackingIntegrationAdapter,
  {
    readonly testIntegration: ({
      apiKeyUnencrypted,
    }: {
      apiKeyUnencrypted: string;
    }) => Effect.Effect<void, IntegrationAdapterError>;
    readonly listActivePeople: ({
      workspaceId,
    }: {
      workspaceId: typeof WorkspaceId.Type;
    }) => Effect.Effect<void, IntegrationAdapterError>;

    readonly listProjects: ({
      workspaceId,
    }: {
      workspaceId: typeof WorkspaceId.Type;
    }) => Effect.Effect<
      Array<typeof ExternalProject.Type>,
      IntegrationAdapterError
    >;
    readonly listTasks: ({
      workspaceId,
    }: {
      workspaceId: typeof WorkspaceId.Type;
    }) => Effect.Effect<
      Array<typeof ExternalTask.Type>,
      IntegrationAdapterError
    >;
  }
>() {}
