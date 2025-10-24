import { HttpApiEndpoint, HttpApiError, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import { ProjectResponse } from "../dto/project.dto";

export const ProjectGroup = HttpApiGroup.make("Project").add(
  HttpApiEndpoint.get("List")`/`
    .addSuccess(Schema.Array(ProjectResponse))
    .addError(HttpApiError.InternalServerError)
);
