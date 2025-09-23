import { Schema } from "effect";
import { generateUUID } from "../utils/uuid";
import { WorkspaceId, WorkspaceIntegrationId } from "./shared";

// The encrypted API key is kept out of the domain model.
export class WorkspaceIntegration extends Schema.Struct({
  id: Schema.optionalWith(WorkspaceIntegrationId, {
    default: () => WorkspaceIntegrationId.make(generateUUID()),
  }),
  // References
  workspaceId: WorkspaceId,
  // General
  kind: Schema.Literal("float"),
}) {}

export const WorkspaceIntegrationToUpsert = Schema.Struct({
  kind: WorkspaceIntegration.fields.kind,
  apiKey: Schema.NonEmptyString,
});
