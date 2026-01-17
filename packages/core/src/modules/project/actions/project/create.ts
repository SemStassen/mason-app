import { Effect } from "effect";
import { type CreateProject, Project } from "../../domain";
import { ProjectRepository } from "../../repositories";

export type CreateProjectInput = CreateProject;

export type CreateProjectOutput = void;

export const CreateProjectAction = Effect.fn("project/CreateProjectAction")(
  function* (input: CreateProjectInput) {
    const projectRepo = yield* ProjectRepository;

    const project = yield* Project.create(input);

    yield* projectRepo.insert({ projects: [project] });
  }
);
