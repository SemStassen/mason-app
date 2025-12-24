import type { PlainApiKey } from "@mason/framework/types";
import { Context, type Effect } from "effect";
import type { AdapterError } from "./errors";
import type { ExternalProject, ExternalTask } from "./models";

export class TimeTrackingIntegrationAdapter extends Context.Tag(
  "@mason/adapters/TimeTrackingIntegrationAdapter"
)<
  TimeTrackingIntegrationAdapter,
  {
    readonly testIntegration: (params: {
      apiKey: PlainApiKey;
    }) => Effect.Effect<void, AdapterError>;
    readonly listActivePeople: (params: {
      apiKey: PlainApiKey;
    }) => Effect.Effect<void, AdapterError>;
    readonly listProjects: (params: {
      apiKey: PlainApiKey;
    }) => Effect.Effect<Array<ExternalProject>, AdapterError>;
    readonly listTasks: (params: {
      apiKey: PlainApiKey;
    }) => Effect.Effect<Array<ExternalTask>, AdapterError>;
  }
>() {}
