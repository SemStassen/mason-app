import { Option, Result } from "effect";
import { TaskId } from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";
import { Task } from "./task.entity";

export const createTask = (params: {
  workspaceId: Task["workspaceId"];
  data: typeof Task.jsonCreate.Type;
}): Result.Result<Task, never> => {
  const { id, ...rest } = params.data;

  return Result.succeed(
    Task.make({
      id: Option.getOrElse(id, () => TaskId.makeUnsafe(generateUUID())),
      workspaceId: params.workspaceId,
      archivedAt: Option.none(),
      ...rest,
    })
  );
};

export const updateTask = (params: {
  task: Task;
  data: typeof Task.jsonUpdate.Type;
}): Result.Result<{ entity: Task; changes: typeof Task.update.Type }, never> =>
  Result.succeed({
    entity: Task.make({
      ...params.task,
      ...params.data,
    }),
    changes: params.data,
  });
