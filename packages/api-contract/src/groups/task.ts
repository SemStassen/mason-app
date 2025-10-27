import { HttpApiEndpoint, HttpApiError, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import { TaskResponse } from "../dto/task.dto";

export const TaskGroup = HttpApiGroup.make("Task").add(
  HttpApiEndpoint.get("List")`/`
    .addSuccess(Schema.Array(TaskResponse))
    .addError(HttpApiError.InternalServerError)
);
