import type { DbTask } from "@mason/db/schema";
import { Effect, Schema } from "effect";
import { generateUUID } from "../utils/uuid";
import { ProjectId, TaskId, WorkspaceId } from "./ids";

export class Task extends Schema.Class<Task>("@mason/mason/task")({
  id: TaskId,
  // References
  workspaceId: WorkspaceId,
  projectId: ProjectId,
  // General
  name: Schema.NonEmptyString.pipe(Schema.maxLength(255)),
  // Nullable
  _metadata: Schema.NullOr(
    Schema.Struct({
      source: Schema.optionalWith(Schema.Literal("float"), {
        exact: true,
      }),
      externalId: Schema.optionalWith(Schema.String, {
        exact: true,
      }),
    })
  ),
}) {
  static makeFromDb(dbRecord: DbTask) {
    // biome-ignore lint/correctness/useYield: These should be effects
    return Effect.gen(function* () {
      return new Task({
        ...dbRecord,
        id: TaskId.make(dbRecord.id),
        projectId: ProjectId.make(dbRecord.projectId),
        workspaceId: WorkspaceId.make(dbRecord.workspaceId),
      });
    });
  }

  static makeFromCreate(
    input: typeof TaskToCreate.Type,
    workspaceId: typeof WorkspaceId.Type
  ) {
    // biome-ignore lint/correctness/useYield: These should be effects
    return Effect.gen(function* () {
      return new Task({
        ...input,
        id: TaskId.make(generateUUID()),
        workspaceId: workspaceId,
      });
    });
  }

  static makeFromUpdate(input: typeof TaskToUpdate.Type, existing: DbTask) {
    return Effect.gen(function* () {
      const existingTask = yield* Task.makeFromDb(existing);
      return new Task({
        ...existingTask,
        ...input,
        workspaceId: WorkspaceId.make(existing.workspaceId),
      });
    });
  }
}

export const TaskToCreate = Schema.TaggedStruct("TaskToCreate", {
  // References
  projectId: Task.fields.projectId,
  // General
  name: Task.fields.name,
  _metadata: Schema.optionalWith(Task.fields._metadata, {
    default: () => null,
    exact: true,
  }),
});

export const TaskToUpdate = Schema.TaggedStruct("TaskToUpdate", {
  id: Task.fields.id,
  // References
  projectId: Task.fields.projectId,
  // General
  name: Schema.optionalWith(Task.fields.name, { exact: true }),
  _metadata: Schema.optionalWith(Task.fields._metadata, { exact: true }),
});
