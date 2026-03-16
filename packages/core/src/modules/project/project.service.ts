import { type Effect, Schema, ServiceMap } from "effect";
import type { RepositoryError } from "#shared/database/index";
import { ProjectId, TaskId } from "#shared/schemas/index";
import type { Project } from "./domain/project.entity";
import type {
	ProjectArchivedError,
	ProjectEndDateBeforeStartDateError,
} from "./domain/project.errors";
import type { Task } from "./domain/task.entity";

export class ProjectNotFoundError extends Schema.TaggedErrorClass<ProjectNotFoundError>()(
	"project/ProjectNotFoundError",
	{
		projectId: ProjectId,
	},
) {}

export class TaskNotFoundError extends Schema.TaggedErrorClass<TaskNotFoundError>()(
	"project/TaskNotFoundError",
	{
		taskId: TaskId,
	},
) {}

interface ProjectModuleShape {
	readonly createProjects: (params: {
		workspaceId: Project["workspaceId"];
		data: ReadonlyArray<typeof Project.jsonCreate.Type>;
	}) => Effect.Effect<
		ReadonlyArray<Project>,
		ProjectEndDateBeforeStartDateError | RepositoryError
	>;
	readonly updateProject: (params: {
		id: Project["id"];
		workspaceId: Project["workspaceId"];
		data: typeof Project.jsonUpdate.Type;
	}) => Effect.Effect<
		Project,
		| ProjectNotFoundError
		| ProjectArchivedError
		| ProjectEndDateBeforeStartDateError
		| RepositoryError
	>;
	readonly archiveProject: (params: {
		id: Project["id"];
		workspaceId: Project["workspaceId"];
	}) => Effect.Effect<void, ProjectNotFoundError | RepositoryError>;
	readonly restoreProject: (params: {
		id: Project["id"];
		workspaceId: Project["workspaceId"];
	}) => Effect.Effect<void, ProjectNotFoundError | RepositoryError>;

	readonly createTasks: (params: {
		workspaceId: Task["workspaceId"];
		data: ReadonlyArray<typeof Task.jsonCreate.Type>;
	}) => Effect.Effect<
		ReadonlyArray<Task>,
		ProjectNotFoundError | ProjectArchivedError | RepositoryError
	>;
	readonly updateTask: (params: {
		id: Task["id"];
		workspaceId: Task["workspaceId"];
		data: typeof Task.jsonUpdate.Type;
	}) => Effect.Effect<
		Task,
		| TaskNotFoundError
		| ProjectNotFoundError
		| ProjectArchivedError
		| RepositoryError
	>;
	readonly archiveTask: (params: {
		id: Task["id"];
		workspaceId: Task["workspaceId"];
	}) => Effect.Effect<
		void,
		| TaskNotFoundError
		| ProjectNotFoundError
		| ProjectArchivedError
		| RepositoryError
	>;
	readonly restoreTask: (params: {
		id: Task["id"];
		workspaceId: Task["workspaceId"];
	}) => Effect.Effect<
		void,
		| TaskNotFoundError
		| ProjectNotFoundError
		| ProjectArchivedError
		| RepositoryError
	>;
}

export class ProjectModule extends ServiceMap.Service<
	ProjectModule,
	ProjectModuleShape
>()("@mason/project/ProjectModule") {}
