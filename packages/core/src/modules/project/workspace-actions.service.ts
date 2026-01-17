import { Context, Effect, Layer } from "effect";
import { MasonError } from "~/shared/errors";
import {
  ArchiveProjectAction,
  type ArchiveProjectInput,
  type ArchiveProjectOutput,
  ArchiveTaskAction,
  type ArchiveTaskInput,
  type ArchiveTaskOutput,
  CreateProjectAction,
  type CreateProjectInput,
  type CreateProjectOutput,
  CreateTaskAction,
  type CreateTaskInput,
  type CreateTaskOutput,
  PatchProjectAction,
  type PatchProjectInput,
  type PatchProjectOutput,
  PatchTaskAction,
  type PatchTaskInput,
  type PatchTaskOutput,
  type RestoreProjectInput,
  type RestoreProjectOutput,
  RestoreTaskAction,
  type RestoreTaskInput,
  type RestoreTaskOutput,
} from "./actions";
import type { ProjectArchivedError } from "./domain";
import { ProjectRepository, TaskRepository } from "./repositories";

export class ProjectActionsService extends Context.Tag(
  "@mason/project/ProjectActionsService"
)<
  ProjectActionsService,
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
    ProjectActionsService,
    Effect.gen(function* () {
      const projectRepo = yield* ProjectRepository;
      const taskRepo = yield* TaskRepository;

      const services = Context.make(ProjectRepository, projectRepo).pipe(
        Context.add(TaskRepository, taskRepo)
      );

      return ProjectActionsService.of({
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
          ArchiveProjectAction(params).pipe(
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
