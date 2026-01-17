import { Effect, Option } from "effect";
import { AssertProjectNotArchived, type CreateTask, Task } from "../../domain";
import { ProjectRepository, TaskRepository } from "../../repositories";
import { ProjectNotFoundError } from "../../errors";

export type CreateTaskInput = CreateTask;

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
      .pipe(Effect.map(Option.getOrThrowWith(() => new ProjectNotFoundError())));


    yield* AssertProjectNotArchived(project);

    const task = yield* Task.create(input);

    yield* taskRepo.insert({ tasks: [task] });
  }
);
