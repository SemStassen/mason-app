import { Schema } from "effect";

class WorkspaceIntegration extends Schema.Struct({
  id: Schema.NonEmptyString,
  // References
  workspaceId: Schema.NonEmptyString,
  // General
  kind: Schema.Literal("float"),
}) {}

export const WorkspaceIntegrationResponse = Schema.Struct(
  WorkspaceIntegration.fields
);
