import { Schema } from "effect";
import { Task } from "#modules/project/index";

export const CreateTaskCommand = Task.jsonCreate;
export const CreateTaskResult = Task.json;

export const UpdateTaskCommand = Schema.Struct({
  id: Task.fields.id,
  data: Task.jsonUpdate,
});
export const UpdateTaskResult = Task.json;

export const ArchiveTaskCommand = Schema.Struct({
  id: Task.fields.id,
});
export const ArchiveTaskResult = Schema.Void;

export const RestoreTaskCommand = Schema.Struct({
  id: Task.fields.id,
});
export const RestoreTaskResult = Schema.Void;
