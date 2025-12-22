import type { ApiKey } from "@mason/framework/types";
import { Context, type Effect } from "effect";
import type { AdapterError } from "./errors";
import type { ExternalProject, ExternalTask } from "./models";

export class TimeTrackingIntegrationAdapter extends Context.Tag(
  "@mason/adapters/TimeTrackingIntegrationAdapter"
)<
  TimeTrackingIntegrationAdapter,
  {
    readonly testIntegration: (params: {
      apiKey: ApiKey;
    }) => Effect.Effect<void, AdapterError>;
    readonly listActivePeople: (params: {
      apiKey: ApiKey;
    }) => Effect.Effect<void, AdapterError>;
    readonly listProjects: (params: {
      apiKey: ApiKey;
    }) => Effect.Effect<Array<ExternalProject>, AdapterError>;
    readonly listTasks: (params: {
      apiKey: ApiKey;
    }) => Effect.Effect<Array<ExternalTask>, AdapterError>;
  }
>() {}
