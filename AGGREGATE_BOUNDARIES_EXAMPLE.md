# Aggregate Boundaries Implementation Example

This document shows how to refactor `Project` and `Task` to follow DDD aggregate patterns.

## Key Principles

1. **Project is the Aggregate Root** - All task operations go through the Project
2. **Tasks are Entities within the Aggregate** - They can't be accessed directly from outside
3. **Repository loads/saves the entire aggregate** - Project + all its Tasks together
4. **Business rules enforced at aggregate level** - Invariants maintained within the aggregate
5. **Transaction boundaries** - All changes to an aggregate happen atomically

## Current Problem

```typescript
// ❌ Current: Tasks can be modified independently
projectService.createTasks({ workspaceId, tasks: [...] });
taskService.updateTasks({ workspaceId, tasks: [...] });

// ❌ No way to enforce: "Can't delete a project with active tasks"
// ❌ No way to enforce: "Task names must be unique within a project"
// ❌ No transactional guarantee that project + tasks stay consistent
```

## Solution: Project Aggregate

### 1. Updated Project Model (Aggregate Root)

```typescript
// packages/core/modules/project/src/models/project.model.ts
import { ProjectId, TaskId, WorkspaceId } from "@mason/framework/types";
import { JsonRecord } from "@mason/framework/utils/schema";
import { generateUUID } from "@mason/framework/utils/uuid";
import { Chunk, Effect, Option, Schema } from "effect";
import { Task } from "./task.model";

export class ProjectNotFoundError extends Schema.TaggedError<ProjectNotFoundError>()(
  "@mason/project/ProjectNotFoundError",
  {
    projectId: ProjectId,
  }
) {}

export class TaskNotFoundError extends Schema.TaggedError<TaskNotFoundError>()(
  "@mason/project/TaskNotFoundError",
  {
    projectId: ProjectId,
    taskId: TaskId,
  }
) {}

export class DuplicateTaskNameError extends Schema.TaggedError<DuplicateTaskNameError>()(
  "@mason/project/DuplicateTaskNameError",
  {
    projectId: ProjectId,
    taskName: Schema.String,
  }
) {}

export class ProjectWithActiveTasksError extends Schema.TaggedError<ProjectWithActiveTasksError>()(
  "@mason/project/ProjectWithActiveTasksError",
  {
    projectId: ProjectId,
    activeTaskCount: Schema.Number,
  }
) {}

// Project Aggregate Root
export class Project extends Schema.Class<Project>("@mason/mason/project")({
  id: ProjectId,
  workspaceId: WorkspaceId,
  name: Schema.NonEmptyString.pipe(Schema.maxLength(255)),
  hexColor: Schema.NonEmptyString.pipe(Schema.maxLength(9)),
  isBillable: Schema.Boolean,
  startDate: Schema.NullOr(Schema.DateFromSelf),
  endDate: Schema.NullOr(Schema.DateFromSelf),
  notes: Schema.NullOr(JsonRecord),
  _metadata: Schema.NullOr(
    Schema.Struct({
      source: Schema.optionalWith(Schema.Literal("float"), { exact: true }),
      externalId: Schema.optionalWith(Schema.String, { exact: true }),
    })
  ),
  // Aggregate contains its entities
  tasks: Schema.Array(Task),
}) {
  // Domain methods for managing tasks within the aggregate

  /**
   * Add a task to the project.
   * Enforces business rule: Task names must be unique within a project.
   */
  addTask(
    taskName: string,
    metadata?: Task["_metadata"]
  ): Effect.Effect<Project, DuplicateTaskNameError> {
    // Business rule: Check for duplicate task names
    const existingTask = this.tasks.find((t) => t.name === taskName);
    if (existingTask) {
      return Effect.fail(
        new DuplicateTaskNameError({
          projectId: this.id,
          taskName,
        })
      );
    }

    const newTask = Task.make({
      id: TaskId.make(generateUUID()),
      workspaceId: this.workspaceId,
      projectId: this.id,
      name: taskName,
      _metadata: metadata ?? null,
    });

    return Effect.succeed(
      Project.make({
        ...this,
        tasks: [...this.tasks, newTask],
      })
    );
  }

  /**
   * Update a task within the project.
   * Tasks can only be updated through the aggregate root.
   */
  updateTask(
    taskId: TaskId,
    updates: { name?: string; _metadata?: Task["_metadata"] }
  ): Effect.Effect<Project, TaskNotFoundError | DuplicateTaskNameError> {
    const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      return Effect.fail(
        new TaskNotFoundError({
          projectId: this.id,
          taskId,
        })
      );
    }

    // Business rule: Check for duplicate names (excluding current task)
    if (updates.name) {
      const duplicateTask = this.tasks.find(
        (t) => t.id !== taskId && t.name === updates.name
      );
      if (duplicateTask) {
        return Effect.fail(
          new DuplicateTaskNameError({
            projectId: this.id,
            taskName: updates.name,
          })
        );
      }
    }

    const updatedTask = this.tasks[taskIndex].patch({
      name: updates.name,
      _metadata: updates._metadata,
    });

    return updatedTask.pipe(
      Effect.map((task) => {
        const newTasks = [...this.tasks];
        newTasks[taskIndex] = task;
        return Project.make({
          ...this,
          tasks: newTasks,
        });
      })
    );
  }

  /**
   * Remove a task from the project.
   */
  removeTask(taskId: TaskId): Effect.Effect<Project, TaskNotFoundError> {
    const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      return Effect.fail(
        new TaskNotFoundError({
          projectId: this.id,
          taskId,
        })
      );
    }

    return Effect.succeed(
      Project.make({
        ...this,
        tasks: this.tasks.filter((t) => t.id !== taskId),
      })
    );
  }

  /**
   * Get a task by ID (read-only access).
   */
  getTask(taskId: TaskId): Option.Option<Task> {
    return Option.fromNullable(this.tasks.find((t) => t.id === taskId));
  }

  /**
   * Get all tasks (read-only access).
   */
  getTasks(): ReadonlyArray<Task> {
    return this.tasks;
  }

  /**
   * Business rule: Check if project can be deleted.
   * This could check for active time entries, etc.
   */
  canBeDeleted(): boolean {
    // Example: Can't delete if there are tasks (or active time entries)
    // This would be expanded based on your business rules
    return this.tasks.length === 0;
  }

  /**
   * Business rule: Attempt to delete the project.
   */
  delete(): Effect.Effect<Project, ProjectWithActiveTasksError> {
    if (!this.canBeDeleted()) {
      return Effect.fail(
        new ProjectWithActiveTasksError({
          projectId: this.id,
          activeTaskCount: this.tasks.length,
        })
      );
    }
    return Effect.succeed(this);
  }

  // Factory methods
  static readonly Create = Schema.Struct({
    name: Project.fields.name,
    hexColor: Schema.optionalWith(Project.fields.hexColor, {
      default: () => "#ff0000",
      exact: true,
    }),
    isBillable: Schema.optionalWith(Project.fields.isBillable, {
      default: () => true,
      exact: true,
    }),
    startDate: Schema.optionalWith(Project.fields.startDate, {
      default: () => null,
      exact: true,
    }),
    endDate: Schema.optionalWith(Project.fields.endDate, {
      default: () => null,
      exact: true,
    }),
    notes: Schema.optionalWith(Project.fields.notes, {
      default: () => null,
      exact: true,
    }),
    _metadata: Schema.optionalWith(Project.fields._metadata, {
      default: () => null,
      exact: true,
    }),
  });

  static makeFromCreate(
    input: typeof Project.Create.Type,
    workspaceId: WorkspaceId
  ) {
    return Schema.decodeUnknown(Project.Create)(input).pipe(
      Effect.map((validated) =>
        Project.make({
          ...validated,
          id: ProjectId.make(generateUUID()),
          workspaceId,
          tasks: [], // New projects start with no tasks
        })
      )
    );
  }

  static readonly Patch = Schema.Struct({
    name: Schema.optionalWith(Project.fields.name, { exact: true }),
    hexColor: Schema.optionalWith(Project.fields.hexColor, { exact: true }),
    isBillable: Schema.optionalWith(Project.fields.isBillable, { exact: true }),
    startDate: Schema.optionalWith(Project.fields.startDate, { exact: true }),
    endDate: Schema.optionalWith(Project.fields.endDate, { exact: true }),
    notes: Schema.optionalWith(Project.fields.notes, { exact: true }),
    _metadata: Schema.optionalWith(Project.fields._metadata, { exact: true }),
  });

  patch(updates: typeof Project.Patch.Type) {
    return Schema.decodeUnknown(Project.Patch)(updates).pipe(
      Effect.map((validated) => Project.make({ ...this, ...validated }))
    );
  }
}
```

### 2. Updated Repository (Loads/Saves Aggregates)

```typescript
// packages/core/modules/project/src/repositories/project.repo.ts
import { SqlSchema } from "@effect/sql";
import { and, eq, inArray, sql } from "@mason/db/operators";
import { projectsTable, tasksTable } from "@mason/db/schema";
import { DatabaseService } from "@mason/db/service";
import type { RepositoryError } from "@mason/framework/errors/database";
import { ProjectId, WorkspaceId } from "@mason/framework/types";
import { Context, Effect, Layer, Option, Schema } from "effect";
import { Project } from "../models/project.model";
import { Task } from "../models/task.model";

export class ProjectRepository extends Context.Tag(
  "@mason/project/ProjectRepository"
)<
  ProjectRepository,
  {
    // Load entire aggregate (Project + Tasks)
    findById: (params: {
      workspaceId: WorkspaceId;
      projectId: ProjectId;
    }) => Effect.Effect<Option.Option<Project>, RepositoryError>;

    // Save entire aggregate atomically
    save: (params: {
      workspaceId: WorkspaceId;
      project: Project;
    }) => Effect.Effect<Project, RepositoryError>;

    // List projects (without tasks for performance)
    list: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: Array<ProjectId>;
        _source?: "float";
        _externalIds?: Array<string>;
      };
    }) => Effect.Effect<ReadonlyArray<Project>, RepositoryError>;

    // Delete project (cascades to tasks via DB foreign keys)
    delete: (params: {
      workspaceId: WorkspaceId;
      projectId: ProjectId;
    }) => Effect.Effect<void, RepositoryError>;
  }
>() {
  static readonly live = Layer.effect(
    ProjectRepository,
    Effect.gen(function* () {
      const db = yield* DatabaseService;

      // Load project with all its tasks
      const FindProjectById = SqlSchema.option({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          projectId: ProjectId,
        }),
        Result: Project,
        execute: ({ workspaceId, projectId }) =>
          Effect.gen(function* () {
            // Load project
            const projectRow = yield* db.drizzle.query.projectsTable.findFirst({
              where: and(
                eq(projectsTable.workspaceId, workspaceId),
                eq(projectsTable.id, projectId)
              ),
            });

            if (!projectRow) {
              return Option.none();
            }

            // Load all tasks for this project
            const taskRows = yield* db.drizzle.query.tasksTable.findMany({
              where: and(
                eq(tasksTable.workspaceId, workspaceId),
                eq(tasksTable.projectId, projectId)
              ),
            });

            // Map to domain models
            const tasks = yield* Effect.forEach(taskRows, (row) =>
              Schema.decodeUnknown(Task)(row)
            );

            // Construct aggregate
            const project = yield* Schema.decodeUnknown(Project)({
              ...projectRow,
              tasks,
            });

            return Option.some(project);
          }),
      });

      // Save entire aggregate atomically
      const SaveProject = SqlSchema.option({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          project: Project,
        }),
        Result: Project,
        execute: ({ workspaceId, project }) =>
          Effect.gen(function* () {
            // Check if project exists
            const existing = yield* db.drizzle.query.projectsTable.findFirst({
              where: and(
                eq(projectsTable.workspaceId, workspaceId),
                eq(projectsTable.id, project.id)
              ),
            });

            if (existing) {
              // Update project
              yield* db.drizzle
                .update(projectsTable)
                .set({
                  name: project.name,
                  hexColor: project.hexColor,
                  isBillable: project.isBillable,
                  startDate: project.startDate,
                  endDate: project.endDate,
                  notes: project.notes,
                  _metadata: project._metadata,
                })
                .where(eq(projectsTable.id, project.id));
            } else {
              // Insert project
              yield* db.drizzle.insert(projectsTable).values({
                id: project.id,
                workspaceId: project.workspaceId,
                name: project.name,
                hexColor: project.hexColor,
                isBillable: project.isBillable,
                startDate: project.startDate,
                endDate: project.endDate,
                notes: project.notes,
                _metadata: project._metadata,
              });
            }

            // Get current tasks from DB
            const existingTasks = yield* db.drizzle.query.tasksTable.findMany({
              where: and(
                eq(tasksTable.workspaceId, workspaceId),
                eq(tasksTable.projectId, project.id)
              ),
            });

            const existingTaskIds = new Set(existingTasks.map((t) => t.id));
            const newTaskIds = new Set(project.tasks.map((t) => t.id));

            // Delete tasks that are no longer in the aggregate
            const tasksToDelete = existingTasks.filter(
              (t) => !newTaskIds.has(t.id)
            );
            if (tasksToDelete.length > 0) {
              yield* db.drizzle.delete(tasksTable).where(
                inArray(
                  tasksTable.id,
                  tasksToDelete.map((t) => t.id)
                )
              );
            }

            // Insert/Update tasks
            for (const task of project.tasks) {
              if (existingTaskIds.has(task.id)) {
                // Update existing task
                yield* db.drizzle
                  .update(tasksTable)
                  .set({
                    name: task.name,
                    _metadata: task._metadata,
                  })
                  .where(eq(tasksTable.id, task.id));
              } else {
                // Insert new task
                yield* db.drizzle.insert(tasksTable).values({
                  id: task.id,
                  workspaceId: task.workspaceId,
                  projectId: task.projectId,
                  name: task.name,
                  _metadata: task._metadata,
                });
              }
            }

            // Reload to get the saved state
            return yield* FindProjectById({
              workspaceId,
              projectId: project.id,
            });
          }),
      });

      return ProjectRepository.of({
        findById: Effect.fn("@mason/project/ProjectRepo.findById")(
          ({ workspaceId, projectId }) =>
            db.withWorkspace(
              workspaceId,
              FindProjectById({ workspaceId, projectId })
            )
        ),

        save: Effect.fn("@mason/project/ProjectRepo.save")(
          ({ workspaceId, project }) =>
            db.withWorkspace(workspaceId, SaveProject({ workspaceId, project }))
        ),

        list: Effect.fn("@mason/project/ProjectRepo.list")(
          ({ workspaceId, query }) => {
            // Simplified - loads projects without tasks for list view
            // Full aggregate loaded only when needed
            return db.withWorkspace(
              workspaceId,
              Effect.gen(function* () {
                const whereConditions = [
                  eq(projectsTable.workspaceId, workspaceId),
                  query?.ids ? inArray(projectsTable.id, query.ids) : undefined,
                  // ... other conditions
                ].filter(Boolean);

                const rows = yield* db.drizzle.query.projectsTable.findMany({
                  where: and(...whereConditions),
                });

                // Return projects with empty tasks array for list view
                return yield* Effect.forEach(rows, (row) =>
                  Schema.decodeUnknown(Project)({ ...row, tasks: [] })
                );
              })
            );
          }
        ),

        delete: Effect.fn("@mason/project/ProjectRepo.delete")(
          ({ workspaceId, projectId }) =>
            db.withWorkspace(
              workspaceId,
              Effect.gen(function* () {
                // Cascade delete handled by DB foreign keys
                yield* db.drizzle
                  .delete(projectsTable)
                  .where(
                    and(
                      eq(projectsTable.workspaceId, workspaceId),
                      eq(projectsTable.id, projectId)
                    )
                  );
              })
            )
        ),
      });
    })
  );
}
```

### 3. Updated Service (Works with Aggregates)

```typescript
// packages/core/modules/project/src/project-module.service.ts
import type { ProjectId, TaskId, WorkspaceId } from "@mason/framework/types";
import { Context, Effect, Layer, Option } from "effect";
import type { ProjectToCreate, ProjectToUpdate } from "./dto";
import {
  DuplicateTaskNameError,
  ProjectNotFoundError,
  ProjectWithActiveTasksError,
  TaskNotFoundError,
  type ProjectModuleError,
} from "./errors";
import { Project } from "./models/project.model";
import { Task } from "./models/task.model";
import { ProjectRepository } from "./repositories/project.repo";

export class ProjectModuleService extends Context.Tag(
  "@mason/project/ProjectModuleService"
)<
  ProjectModuleService,
  {
    // Project operations
    createProject: (params: {
      workspaceId: WorkspaceId;
      project: ProjectToCreate;
    }) => Effect.Effect<Project, ProjectModuleError>;

    updateProject: (params: {
      workspaceId: WorkspaceId;
      project: ProjectToUpdate;
    }) => Effect.Effect<Project, ProjectModuleError>;

    deleteProject: (params: {
      workspaceId: WorkspaceId;
      projectId: ProjectId;
    }) => Effect.Effect<void, ProjectModuleError>;

    getProject: (params: {
      workspaceId: WorkspaceId;
      projectId: ProjectId;
    }) => Effect.Effect<Project, ProjectModuleError>;

    listProjects: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: Array<ProjectId>;
        _source?: "float";
        _externalIds?: Array<string>;
      };
    }) => Effect.Effect<ReadonlyArray<Project>, ProjectModuleError>;

    // Task operations go through the aggregate
    addTaskToProject: (params: {
      workspaceId: WorkspaceId;
      projectId: ProjectId;
      taskName: string;
      metadata?: Task["_metadata"];
    }) => Effect.Effect<Project, ProjectModuleError>;

    updateTaskInProject: (params: {
      workspaceId: WorkspaceId;
      projectId: ProjectId;
      taskId: TaskId;
      updates: { name?: string; _metadata?: Task["_metadata"] };
    }) => Effect.Effect<Project, ProjectModuleError>;

    removeTaskFromProject: (params: {
      workspaceId: WorkspaceId;
      projectId: ProjectId;
      taskId: TaskId;
    }) => Effect.Effect<Project, ProjectModuleError>;
  }
>() {
  static readonly live = Layer.effect(
    ProjectModuleService,
    Effect.gen(function* () {
      const projectRepo = yield* ProjectRepository;

      return ProjectModuleService.of({
        createProject: Effect.fn(
          "@mason/project/ProjectModuleService.createProject"
        )(function* ({ workspaceId, project }) {
          const newProject = yield* Project.makeFromCreate(
            project,
            workspaceId
          );
          return yield* projectRepo.save({ workspaceId, project: newProject });
        }),

        updateProject: Effect.fn(
          "@mason/project/ProjectModuleService.updateProject"
        )(function* ({ workspaceId, project }) {
          const existingProject = yield* projectRepo.findById({
            workspaceId,
            projectId: project.id,
          });

          const projectToUpdate = yield* Option.match(existingProject, {
            onNone: () =>
              Effect.fail(new ProjectNotFoundError({ projectId: project.id })),
            onSome: (p) => p.patch(project),
          });

          return yield* projectRepo.save({
            workspaceId,
            project: projectToUpdate,
          });
        }),

        deleteProject: Effect.fn(
          "@mason/project/ProjectModuleService.deleteProject"
        )(function* ({ workspaceId, projectId }) {
          const project = yield* projectRepo.findById({
            workspaceId,
            projectId,
          });

          const projectToDelete = yield* Option.match(project, {
            onNone: () => Effect.fail(new ProjectNotFoundError({ projectId })),
            onSome: (p) => p.delete(),
          });

          // If delete() succeeded, actually delete from repository
          yield* projectRepo.delete({ workspaceId, projectId });
        }),

        getProject: Effect.fn("@mason/project/ProjectModuleService.getProject")(
          function* ({ workspaceId, projectId }) {
            const project = yield* projectRepo.findById({
              workspaceId,
              projectId,
            });

            return yield* Option.match(project, {
              onNone: () =>
                Effect.fail(new ProjectNotFoundError({ projectId })),
              onSome: (p) => Effect.succeed(p),
            });
          }
        ),

        listProjects: Effect.fn(
          "@mason/project/ProjectModuleService.listProjects"
        )((params) => projectRepo.list(params)),

        // Task operations through aggregate
        addTaskToProject: Effect.fn(
          "@mason/project/ProjectModuleService.addTaskToProject"
        )(function* ({ workspaceId, projectId, taskName, metadata }) {
          const project = yield* projectRepo.findById({
            workspaceId,
            projectId,
          });

          const projectWithTask = yield* Option.match(project, {
            onNone: () => Effect.fail(new ProjectNotFoundError({ projectId })),
            onSome: (p) => p.addTask(taskName, metadata),
          });

          return yield* projectRepo.save({
            workspaceId,
            project: projectWithTask,
          });
        }),

        updateTaskInProject: Effect.fn(
          "@mason/project/ProjectModuleService.updateTaskInProject"
        )(function* ({ workspaceId, projectId, taskId, updates }) {
          const project = yield* projectRepo.findById({
            workspaceId,
            projectId,
          });

          const projectWithUpdatedTask = yield* Option.match(project, {
            onNone: () => Effect.fail(new ProjectNotFoundError({ projectId })),
            onSome: (p) => p.updateTask(taskId, updates),
          });

          return yield* projectRepo.save({
            workspaceId,
            project: projectWithUpdatedTask,
          });
        }),

        removeTaskFromProject: Effect.fn(
          "@mason/project/ProjectModuleService.removeTaskFromProject"
        )(function* ({ workspaceId, projectId, taskId }) {
          const project = yield* projectRepo.findById({
            workspaceId,
            projectId,
          });

          const projectWithoutTask = yield* Option.match(project, {
            onNone: () => Effect.fail(new ProjectNotFoundError({ projectId })),
            onSome: (p) => p.removeTask(taskId),
          });

          return yield* projectRepo.save({
            workspaceId,
            project: projectWithoutTask,
          });
        }),
      });
    })
  );
}
```

## Usage Examples

### Creating a Project with Tasks

```typescript
const program = Effect.gen(function* () {
  const projectService = yield* ProjectModuleService;

  // Create project
  const project = yield* projectService.createProject({
    workspaceId,
    project: {
      name: "New Project",
      hexColor: "#ff0000",
    },
  });

  // Add tasks through aggregate
  const projectWithTasks = yield* projectService.addTaskToProject({
    workspaceId,
    projectId: project.id,
    taskName: "Task 1",
  });

  const finalProject = yield* projectService.addTaskToProject({
    workspaceId,
    projectId: projectWithTasks.id,
    taskName: "Task 2",
  });

  return finalProject;
});
```

### Enforcing Business Rules

```typescript
// ❌ This will fail - duplicate task name
const result =
  yield *
  projectService.addTaskToProject({
    workspaceId,
    projectId: project.id,
    taskName: "Task 1", // Already exists
  });
// Fails with DuplicateTaskNameError

// ❌ This will fail - can't delete project with tasks
const deleteResult =
  yield *
  projectService.deleteProject({
    workspaceId,
    projectId: project.id, // Has tasks
  });
// Fails with ProjectWithActiveTasksError
```

## Benefits

1. **Consistency**: All changes to Project + Tasks happen atomically
2. **Business Rules**: Enforced at aggregate level (unique task names, deletion rules)
3. **Transaction Boundaries**: Clear - one aggregate = one transaction
4. **Encapsulation**: Tasks can't be modified without going through Project
5. **Testability**: Easy to test business rules in isolation

## Migration Path

1. **Phase 1**: Add `tasks` field to `Project` model (backward compatible)
2. **Phase 2**: Update repository to load/save aggregates
3. **Phase 3**: Update service to use aggregate methods
4. **Phase 4**: Deprecate direct task operations
5. **Phase 5**: Remove direct task operations
