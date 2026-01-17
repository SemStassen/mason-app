import { Effect, Option } from "effect";
import type { TaskId, WorkspaceId } from "~/shared/schemas";
import { AssertProjectNotArchived } from "../../domain";
import { ProjectNotFoundError, TaskNotFoundError } from "../../errors";
import { ProjectRepository, TaskRepository } from "../../repositories";

export interface RestoreTaskInput {
  id: TaskId;
  workspaceId: WorkspaceId;
}

export type RestoreTaskOutput = void;

export const RestoreTaskAction = Effect.fn("project/RestoreTaskAction")(
  function* (input: RestoreTaskInput) {
    const projectRepo = yield* ProjectRepository;
    const taskRepo = yield* TaskRepository;

    const task = yield* taskRepo
      .retrieve({
        workspaceId: input.workspaceId,
        query: { id: input.id },
      })
      .pipe(Effect.map(Option.getOrThrowWith(() => new TaskNotFoundError())));

    const project = yield* projectRepo
      .retrieve({
        workspaceId: input.workspaceId,
        query: { id: task.projectId },
      })
      .pipe(
        Effect.map(Option.getOrThrowWith(() => new ProjectNotFoundError()))
      );

    yield* AssertProjectNotArchived(project);

    const restoredTask = yield* task.restore();

    yield* taskRepo.update({
      workspaceId: input.workspaceId,
      tasks: [restoredTask],
    });
  }
);
