import type { ApiKey } from "@mason/framework/types/ids";
import { Context, type Effect } from "effect";
import type { IntegrationAdapterError } from "./errors";
import type { ExternalProject, ExternalTask } from "./models";

export class InternalTimeTrackingIntegrationAdapter extends Context.Tag(
  "@mason/integrations/TimeTrackingAdapter"
)<
  InternalTimeTrackingIntegrationAdapter,
  {
    readonly testIntegration: (params: {
      apiKey: ApiKey;
    }) => Effect.Effect<void, IntegrationAdapterError>;
    readonly listActivePeople: (params: {
      apiKey: ApiKey;
    }) => Effect.Effect<void, IntegrationAdapterError>;
    readonly listProjects: (params: {
      apiKey: ApiKey;
    }) => Effect.Effect<Array<ExternalProject>, IntegrationAdapterError>;
    readonly listTasks: (params: {
      apiKey: ApiKey;
    }) => Effect.Effect<Array<ExternalTask>, IntegrationAdapterError>;
  }
>() {}
