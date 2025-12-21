import type { WorkspaceId } from "@mason/mason/models/ids";
import { Context, type Effect } from "effect";
import type { IntegrationAdapterError } from "./errors";
import type { ExternalProject, ExternalTask } from "./models";

export class InternalTimeTrackingIntegrationAdapter extends Context.Tag(
  "@mason/integrations/TimeTrackingAdapter"
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
