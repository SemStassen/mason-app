import { PlainApiKey, WorkspaceIntegrationId } from "@mason/framework";
import { Schema } from "effect";
import { WorkspaceIntegration } from "./domain";

export type WorkspaceIntegrationToCreateDTO =
  typeof WorkspaceIntegrationToCreateDTO.Type;
export const WorkspaceIntegrationToCreateDTO = Schema.Struct({
  kind: WorkspaceIntegration.WorkspaceIntegrationFields.fields.kind,
  plainApiKey: PlainApiKey,
});

export type WorkspaceIntegrationToUpdateDTO =
  typeof WorkspaceIntegrationToUpdateDTO.Type;
export const WorkspaceIntegrationToUpdateDTO = Schema.Struct({
  id: WorkspaceIntegrationId,
  plainApiKey: Schema.optionalWith(PlainApiKey, { exact: true }),
  _metadata: Schema.optionalWith(
    WorkspaceIntegration.WorkspaceIntegrationFields.fields._metadata,
    { exact: true }
  ),
});
