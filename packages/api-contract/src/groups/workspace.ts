import { HttpApiEndpoint, HttpApiError, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import {
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  WorkspaceResponse,
} from "../dto/workspace.dto";

export const WorkspaceGroup = HttpApiGroup.make("Workspace")
  .add(
    HttpApiEndpoint.get("CheckSlugAvailability")`/check-slug`
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
    HttpApiEndpoint.post("SetActive")`/set-active`
      .setPayload(
        Schema.Struct({
          workspaceId: Schema.optional(Schema.NonEmptyString),
          workspaceSlug: Schema.optional(Schema.NonEmptyString),
        })
      )
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.post("Create")`/`
      .setPayload(CreateWorkspaceRequest)
      .addSuccess(WorkspaceResponse)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.post("Update")`/:workspaceId`
      .setPath(
        Schema.Struct({
          workspaceId: Schema.String,
        })
      )
      .setPayload(UpdateWorkspaceRequest)
      .addSuccess(WorkspaceResponse)
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.get("Retrieve")`/retrieve`
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
    HttpApiEndpoint.get("List")`/`
      .addSuccess(Schema.Array(WorkspaceResponse))
      .addError(HttpApiError.InternalServerError)
  );
