import type { CreateProjectRequest } from "@mason/api-contract/dto/project.dto";
import type { WorkspaceId } from "@mason/core/models/ids";
import { Context, type Effect } from "effect";
import type { IntegrationAdapterError } from "./errors";

export class InternalTimeTrackingIntegrationAdapter extends Context.Tag(
  "@mason/integrations/TimeTrackingAdapter"
)<
  InternalTimeTrackingIntegrationAdapter,
  {
    readonly testIntegration: ({
      workspaceId,
      apiKeyUnencrypted,
    }: {
      workspaceId: typeof WorkspaceId.Type;
      apiKeyUnencrypted: string;
    }) => Effect.Effect<void, IntegrationAdapterError>;

    readonly retrieveActivePersonByEmail: ({
      workspaceId,
      email,
    }: {
      workspaceId: typeof WorkspaceId.Type;
      email: string;
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
      Array<typeof CreateProjectRequest.Type>,
      IntegrationAdapterError
    >;
  }
>() {}
