import type { WorkspaceId } from "@mason/core/models/ids";
import { TasksService } from "@mason/core/services/task.service";
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
