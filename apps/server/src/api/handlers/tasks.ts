import { HttpApiBuilder, HttpApiError } from "@effect/platform";
import { MasonApi } from "@mason/api-contract";
import { TaskResponse } from "@mason/api-contract/dto/task.dto";
import { listTasksUseCase } from "@mason/use-cases/tasks.use-cases";
import { Effect } from "effect";
import { RequestContext } from "~/middleware/auth.middleware";

export const TaskGroupLive = HttpApiBuilder.group(
  MasonApi,
  "Task",
  (handlers) =>
    Effect.gen(function* () {
      return handlers.handle("List", () =>
        Effect.gen(function* () {
          const ctx = yield* RequestContext;

          const tasks = yield* listTasksUseCase({
            workspaceId: ctx.workspaceId,
          });

          return tasks.map((task) => TaskResponse.make(task));
        }).pipe(
          Effect.tapError((e) => Effect.logError(e)),
          Effect.mapError(() => new HttpApiError.InternalServerError())
        )
      );
    })
);
