import { Effect } from "effect";
import { Project } from "../../domain/project.model";
import { ProjectRepository } from "../../repositories/project.repo";

export type CreateProjectInput = typeof Project.createAction.Type;

export type CreateProjectOutput = void;

export const CreateProjectAction = Effect.fn("project/CreateProjectAction")(
  function* (input: CreateProjectInput) {
    const projectRepo = yield* ProjectRepository;

    const project = yield* Project.fromInput(input);

    yield* projectRepo.insert({ projects: [project] });
  }
);
