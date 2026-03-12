import { Effect, Layer, Option } from "effect";
import * as projectTransitions from "./domain/project.transitions";
import * as taskTransitions from "./domain/task.transitions";
import { ProjectRepository } from "./project.repository";
import {
	ProjectModule,
	ProjectNotFoundError,
	TaskNotFoundError,
} from "./project.service";
import { TaskRepository } from "./task.repository";

export const ProjectModuleLayer = Layer.effect(
	ProjectModule,
	Effect.gen(function* () {
		const projectRepo = yield* ProjectRepository;
		const taskRepo = yield* TaskRepository;

		return {
			createProject: Effect.fn("project.createProject")(function* (params) {
				const project = yield* Effect.fromResult(
					projectTransitions.createProject({
						workspaceId: params.workspaceId,
						data: params.data,
					}),
				);

				const [persistedProject] = yield* projectRepo.insert([project]);

				return persistedProject;
			}),
			updateProject: Effect.fn("project.updateProject")(function* (params) {
				const project = yield* projectRepo
					.findById({ workspaceId: params.workspaceId, id: params.id })
					.pipe(
						Effect.flatMap(
							Option.match({
								onNone: () =>
									Effect.fail(
										new ProjectNotFoundError({ projectId: params.id }),
									),
								onSome: Effect.succeed,
							}),
						),
					);

				const updatedProject = yield* Effect.fromResult(
					projectTransitions.updateProject({
						project,
						data: params.data,
					}),
				);

				const persistedProject = yield* projectRepo.update(updatedProject);

				return persistedProject;
			}),
			archiveProject: Effect.fn("project.archiveProject")(function* (params) {
				const project = yield* projectRepo
					.findById({ workspaceId: params.workspaceId, id: params.id })
					.pipe(
						Effect.flatMap(
							Option.match({
								onNone: () =>
									Effect.fail(
										new ProjectNotFoundError({ projectId: params.id }),
									),
								onSome: Effect.succeed,
							}),
						),
					);

				yield* projectRepo.archive({
					workspaceId: params.workspaceId,
					timeEntryIds: [project.id],
				});
			}),
			restoreProject: Effect.fn("project.restoreProject")(function* (params) {
				const project = yield* projectRepo
					.findById({ workspaceId: params.workspaceId, id: params.id })
					.pipe(
						Effect.flatMap(
							Option.match({
								onNone: () =>
									Effect.fail(
										new ProjectNotFoundError({ projectId: params.id }),
									),
								onSome: Effect.succeed,
							}),
						),
					);

				yield* projectRepo.restore({
					workspaceId: params.workspaceId,
					projectIds: [project.id],
				});
			}),
			createTask: Effect.fn("project.createTask")(function* (params) {
				const project = yield* projectRepo
					.findById({
						workspaceId: params.workspaceId,
						id: params.data.projectId,
					})
					.pipe(
						Effect.flatMap(
							Option.match({
								onNone: () =>
									Effect.fail(
										new ProjectNotFoundError({
											projectId: params.data.projectId,
										}),
									),
								onSome: Effect.succeed,
							}),
						),
					);

				yield* Effect.fromResult(
					projectTransitions.ensureProjectNotArchived(project),
				);

				const task = yield* Effect.fromResult(
					taskTransitions.createTask({
						workspaceId: params.workspaceId,
						data: params.data,
					}),
				);

				const [persistedTask] = yield* taskRepo.insert([task]);

				return persistedTask;
			}),
			updateTask: Effect.fn("project.updateTask")(function* (params) {
				const task = yield* taskRepo
					.findById({ workspaceId: params.workspaceId, id: params.id })
					.pipe(
						Effect.flatMap(
							Option.match({
								onNone: () =>
									Effect.fail(new TaskNotFoundError({ taskId: params.id })),
								onSome: Effect.succeed,
							}),
						),
					);

				const project = yield* projectRepo
					.findById({ workspaceId: params.workspaceId, id: task.projectId })
					.pipe(
						Effect.flatMap(
							Option.match({
								onNone: () =>
									Effect.fail(
										new ProjectNotFoundError({ projectId: task.projectId }),
									),
								onSome: Effect.succeed,
							}),
						),
					);

				yield* Effect.fromResult(
					projectTransitions.ensureProjectNotArchived(project),
				);

				const updatedTask = yield* Effect.fromResult(
					taskTransitions.updateTask({ task, data: params.data }),
				);

				const persistedTask = yield* taskRepo.update(updatedTask);

				return persistedTask;
			}),
			archiveTask: Effect.fn("project.archiveTask")(function* (params) {
				const task = yield* taskRepo
					.findById({ workspaceId: params.workspaceId, id: params.id })
					.pipe(
						Effect.flatMap(
							Option.match({
								onNone: () =>
									Effect.fail(new TaskNotFoundError({ taskId: params.id })),
								onSome: Effect.succeed,
							}),
						),
					);

				const project = yield* projectRepo
					.findById({ workspaceId: params.workspaceId, id: task.projectId })
					.pipe(
						Effect.flatMap(
							Option.match({
								onNone: () =>
									Effect.fail(
										new ProjectNotFoundError({ projectId: task.projectId }),
									),
								onSome: Effect.succeed,
							}),
						),
					);

				yield* Effect.fromResult(
					projectTransitions.ensureProjectNotArchived(project),
				);

				yield* taskRepo.archive({
					workspaceId: params.workspaceId,
					timeEntryIds: [task.id],
				});
			}),
			restoreTask: Effect.fn("project.restoreTask")(function* (params) {
				const task = yield* taskRepo
					.findById({ workspaceId: params.workspaceId, id: params.id })
					.pipe(
						Effect.flatMap(
							Option.match({
								onNone: () =>
									Effect.fail(new TaskNotFoundError({ taskId: params.id })),
								onSome: Effect.succeed,
							}),
						),
					);

				const project = yield* projectRepo
					.findById({ workspaceId: params.workspaceId, id: task.projectId })
					.pipe(
						Effect.flatMap(
							Option.match({
								onNone: () =>
									Effect.fail(
										new ProjectNotFoundError({ projectId: task.projectId }),
									),
								onSome: Effect.succeed,
							}),
						),
					);

				yield* Effect.fromResult(
					projectTransitions.ensureProjectNotArchived(project),
				);

				yield* taskRepo.restore({
					workspaceId: params.workspaceId,
					projectIds: [task.id],
				});
			}),
		};
	}),
);
