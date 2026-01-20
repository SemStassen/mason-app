import { Effect } from "effect";
import { Project } from "../../domain";
import { ProjectRepository } from "../../repositories";

export type CreateProjectInput = typeof Project.create.Type;

export type CreateProjectOutput = void;

export const CreateProjectAction = Effect.fn("project/CreateProjectAction")(
  function* (input: CreateProjectInput) {
    const projectRepo = yield* ProjectRepository;

    const project = yield* Project.fromInput(input);

    yield* projectRepo.insert({ projects: [project] });
  }
);
