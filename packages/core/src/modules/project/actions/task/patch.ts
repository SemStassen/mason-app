import { Effect, Option } from "effect";
import type {  TaskId, WorkspaceId } from "~/shared/schemas";
import { AssertProjectNotArchived, type PatchTask } from "../../domain";
import { ProjectNotFoundError, TaskNotFoundError } from "../../errors";
import { ProjectRepository, TaskRepository } from "../../repositories";

export interface PatchTaskInput {
  id: TaskId;
  workspaceId: WorkspaceId;
  patch: PatchTask;
}

export type PatchTaskOutput = void;

export const PatchTaskAction = Effect.fn("project/PatchTaskAction")(function* (
  input: PatchTaskInput
) {
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
    .pipe(Effect.map(Option.getOrThrowWith(() => new ProjectNotFoundError())));

  yield* AssertProjectNotArchived(project);

  const updatedTask = yield* task.patch(input.patch);

  yield* taskRepo.update({
    workspaceId: input.workspaceId,
    tasks: [updatedTask],
  });
});
