import { Schema } from "effect";

const Task = Schema.Struct({
  id: Schema.NonEmptyString,
  // References
  workspaceId: Schema.NonEmptyString,
  projectId: Schema.NonEmptyString,
  // General
  name: Schema.NonEmptyString,
  // Optional
  _metadata: Schema.Struct({
    source: Schema.optionalWith(Schema.Literal("float"), {
      exact: true,
    }),
    externalId: Schema.optionalWith(Schema.String, {
      exact: true,
    }),
  }),
});

export const CreateTaskRequest = Schema.Struct({
  // References
  projectId: Task.fields.projectId,
  // General
  name: Task.fields.name,
});

export const UpdateTaskRequest = Schema.Struct({
  id: Task.fields.id,
  // General
  name: Schema.optionalWith(Task.fields.name, { exact: true }),
});

export const TaskResponse = Schema.TaggedStruct("TaskResponse", {
  ...Task.fields,
  // Optional
  _metadata: Schema.NullOr(Task.fields._metadata),
});
