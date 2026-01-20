import { Effect, Option } from "effect";
import { AssertProjectNotArchived, Task } from "../../domain";
import { ProjectNotFoundError } from "../../errors";
import { ProjectRepository, TaskRepository } from "../../repositories";

export type CreateTaskInput = typeof Task.create.Type;

export type CreateTaskOutput = void;

export const CreateTaskAction = Effect.fn("project/CreateTaskAction")(
  function* (input: CreateTaskInput) {
    const projectRepo = yield* ProjectRepository;
    const taskRepo = yield* TaskRepository;

    const project = yield* projectRepo
      .retrieve({
        workspaceId: input.workspaceId,
        query: { id: input.projectId },
      })
      .pipe(
        Effect.map(Option.getOrThrowWith(() => new ProjectNotFoundError()))
      );

    yield* AssertProjectNotArchived(project);

    const task = yield* Task.fromInput(input);

    yield* taskRepo.insert({ tasks: [task] });
  }
);
