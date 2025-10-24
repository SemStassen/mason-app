import type { WorkspaceId } from "@mason/core/models/ids";
import { TasksService } from "@mason/core/services/task.service";
import { Effect } from "effect";

export const listTasksUseCase = ({
  workspaceId,
}: {
  workspaceId: typeof WorkspaceId.Type;
}) =>
  Effect.gen(function* () {
    const tasksService = yield* TasksService;

    const tasks = yield* tasksService.listTasks({
      workspaceId: workspaceId,
    });

    return tasks;
  });
