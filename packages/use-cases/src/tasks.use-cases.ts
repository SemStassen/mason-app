import type { WorkspaceId } from "@mason/mason/models/ids";
import { TasksService } from "@mason/mason/services/task.service";
import { Effect } from "effect";

export const listTasksUseCase = Effect.fn("listTasksUseCase")(function* ({
  workspaceId,
}: {
  workspaceId: typeof WorkspaceId.Type;
}) {
  const tasksService = yield* TasksService;

  const tasks = yield* tasksService.listTasks({
    workspaceId: workspaceId,
  });

  return tasks;
});
