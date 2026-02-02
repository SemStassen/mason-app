import { Context, Effect, Layer } from "effect";
import { MasonError } from "~/shared/errors";
import type {
  ArchiveProjectInput,
  ArchiveProjectOutput,
} from "./actions/project/archive";
import { ArchiveProjectAction } from "./actions/project/archive";
import type {
  CreateProjectInput,
  CreateProjectOutput,
} from "./actions/project/create";
import { CreateProjectAction } from "./actions/project/create";
import type {
  PatchProjectInput,
  PatchProjectOutput,
} from "./actions/project/patch";
import { PatchProjectAction } from "./actions/project/patch";
import type {
  RestoreProjectInput,
  RestoreProjectOutput,
} from "./actions/project/restore";
import { RestoreProjectAction } from "./actions/project/restore";
import type {
  ArchiveTaskInput,
  ArchiveTaskOutput,
} from "./actions/task/archive";
import { ArchiveTaskAction } from "./actions/task/archive";
import type { CreateTaskInput, CreateTaskOutput } from "./actions/task/create";
import { CreateTaskAction } from "./actions/task/create";
import type { PatchTaskInput, PatchTaskOutput } from "./actions/task/patch";
import { PatchTaskAction } from "./actions/task/patch";
import type {
  RestoreTaskInput,
  RestoreTaskOutput,
} from "./actions/task/restore";
import { RestoreTaskAction } from "./actions/task/restore";
import type { ProjectArchivedError } from "./domain/errors";
import { ProjectRepository } from "./repositories/project.repo";
import { TaskRepository } from "./repositories/task.repo";

export class ProjectModuleService extends Context.Tag(
  "@mason/project/ProjectModuleService"
)<
  ProjectModuleService,
  {
    createProject: (
      params: CreateProjectInput
    ) => Effect.Effect<CreateProjectOutput, MasonError>;
    patchProject: (
      params: PatchProjectInput
    ) => Effect.Effect<PatchProjectOutput, MasonError>;
    archiveProject: (
      params: ArchiveProjectInput
    ) => Effect.Effect<ArchiveProjectOutput, MasonError>;
    restoreProject: (
      params: RestoreProjectInput
    ) => Effect.Effect<RestoreProjectOutput, MasonError>;
    createTask: (
      params: CreateTaskInput
    ) => Effect.Effect<CreateTaskOutput, ProjectArchivedError | MasonError>;
    patchTask: (
      params: PatchTaskInput
    ) => Effect.Effect<PatchTaskOutput, ProjectArchivedError | MasonError>;
    archiveTask: (
      params: ArchiveTaskInput
    ) => Effect.Effect<ArchiveTaskOutput, ProjectArchivedError | MasonError>;
    restoreTask: (
      params: RestoreTaskInput
    ) => Effect.Effect<RestoreTaskOutput, ProjectArchivedError | MasonError>;
  }
>() {
  static readonly live = Layer.effect(
    ProjectModuleService,
    Effect.gen(function* () {
      const projectRepo = yield* ProjectRepository;
      const taskRepo = yield* TaskRepository;

      const services = Context.make(ProjectRepository, projectRepo).pipe(
        Context.add(TaskRepository, taskRepo)
      );

      return ProjectModuleService.of({
        createProject: (params) =>
          CreateProjectAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "project/ProjectTransitionError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        patchProject: (params) =>
          PatchProjectAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "project/ProjectTransitionError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        archiveProject: (params) =>
          ArchiveProjectAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        restoreProject: (params) =>
          RestoreProjectAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        createTask: (params) =>
          CreateTaskAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        patchTask: (params) =>
          PatchTaskAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        archiveTask: (params) =>
          ArchiveTaskAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        restoreTask: (params) =>
          RestoreTaskAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),
      });
    })
  );
}
