import { Atom, Result } from "@effect-atom/atom-react";
import {
  type CreateWorkspaceIntegrationRequest,
  WorkspaceIntegrationResponse,
} from "@mason/api-contract/dto/workspace-integration.dto";
import { Effect } from "effect";
import { MasonAtomClient, MasonClient } from "~/client";

const workspaceIntegrationsAtomReadonly = MasonAtomClient.query(
  "WorkspaceIntegration",
  "List",
  {
    reactivityKeys: ["workspaceIntegrations"],
  }
).pipe(Atom.map(Result.getOrElse(() => [])), Atom.keepAlive);

export const workspaceIntegrationsAtom = Atom.optimistic(
  workspaceIntegrationsAtomReadonly
);

export const createWorkspaceIntegrationAtom = Atom.optimisticFn(
  workspaceIntegrationsAtom,
  {
    reducer: (
      current,
      update: typeof CreateWorkspaceIntegrationRequest.Type
    ) => {
      const optimisticResponse = WorkspaceIntegrationResponse.make({
        id: crypto.randomUUID(),
        workspaceId: "temp",
        kind: update.kind,
        _metadata: null,
        createdAt: new Date(),
      });

      return [...current, optimisticResponse];
    },
    fn: MasonAtomClient.runtime.fn(
      Effect.fnUntraced(function* (update) {
        return yield* MasonClient.WorkspaceIntegration.Create({
          payload: update,
        });
      })
    ),
  }
);

export const deleteWorkspaceIntegrationAtom = Atom.family((id: string) =>
  Atom.optimisticFn(workspaceIntegrationsAtom, {
    reducer: (current) => current.filter((i) => i.id !== id),
    fn: MasonAtomClient.runtime.fn(
      Effect.fnUntraced(function* () {
        return yield* MasonClient.WorkspaceIntegration.Delete({
          path: { id },
        });
      })
    ),
  })
);

const projectsAtomReadonly = MasonAtomClient.query("Project", "List", {
  reactivityKeys: ["projects"],
}).pipe(Atom.map(Result.getOrElse(() => [])), Atom.keepAlive);

export const projectsAtom = Atom.optimistic(projectsAtomReadonly);

const tasksAtomReadonly = MasonAtomClient.query("Task", "List", {
  reactivityKeys: ["tasks"],
}).pipe(Atom.map(Result.getOrElse(() => [])), Atom.keepAlive);

export const tasksAtom = Atom.optimistic(tasksAtomReadonly);

export const projectsWithTasksAtom = Atom.make((get) => {
  const projects = get(projectsAtom);
  const tasks = get(tasksAtom);

  return projects.map((project) => ({
    ...project,
    tasks: tasks.filter((task) => task.projectId === project.id),
  }));
});
