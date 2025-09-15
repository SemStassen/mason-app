import { HttpApiEndpoint, HttpApiError, HttpApiGroup } from "@effect/platform";
import {
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  WorkspaceResponse,
} from "@mason/core/models/workspace.model";
import { Schema } from "effect";

export const WorkspaceGroup = HttpApiGroup.make("Workspace")
  .add(
    HttpApiEndpoint.post("CheckWorkspaceSlugAvailability")`/check-slug`
      .setPayload(
        Schema.Struct({
          slug: Schema.NonEmptyString,
        })
      )
      .addSuccess(
        Schema.Struct({
          status: Schema.Boolean,
        })
      )
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.post("SetActiveWorkspace")`/set-active`
      .setPayload(
        Schema.Struct({
          workspaceId: Schema.optional(Schema.NonEmptyString),
          workspaceSlug: Schema.optional(Schema.NonEmptyString),
        })
      )
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.post("CreateWorkspace")`/create`
      .setPayload(CreateWorkspaceRequest)
      .addSuccess(WorkspaceResponse)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.get("RetrieveWorkspace")`/retrieve`
      .setPayload(
        Schema.Struct({
          workspaceId: Schema.optional(Schema.NonEmptyString),
          workspaceSlug: Schema.optional(Schema.NonEmptyString),
          membersLimit: Schema.optionalWith(Schema.NumberFromString, {
            default: () => 100,
          }),
        })
      )
      .addSuccess(WorkspaceResponse)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.get("ListWorkspaces")`/list`
      .addSuccess(Schema.Array(WorkspaceResponse))
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.post("UpdateWorkspace")`/:workspaceId`
      .setPath(
        Schema.Struct({
          workspaceId: Schema.String,
        })
      )
      .setPayload(UpdateWorkspaceRequest)
      .addSuccess(WorkspaceResponse)
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.InternalServerError)
  );
