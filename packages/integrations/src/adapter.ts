import { Context, type Effect } from "effect";
import type { IntegrationAdapterError } from "./errors";
import type { ExternalProject, ExternalTask } from "./models";
import type { WorkspaceId } from "@mason/framework/types/ids";

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
      workspaceId: WorkspaceId;
    }) => Effect.Effect<void, IntegrationAdapterError>;

    readonly listProjects: ({
      workspaceId,
    }: {
      workspaceId: WorkspaceId;
    }) => Effect.Effect<
      Array<ExternalProject>,
      IntegrationAdapterError
    >;
    readonly listTasks: ({
      workspaceId,
    }: {
      workspaceId: WorkspaceId;
    }) => Effect.Effect<
      Array<ExternalTask>,
      IntegrationAdapterError
    >;
  }
>() {}
