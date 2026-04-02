import { Atom, Result } from "@effect/atom-react";
import { WorkspaceIntegrationResponse } from "@recount/api-contract/dto/workspace-integration.dto";
import type { CreateWorkspaceIntegrationRequest } from "@recount/api-contract/dto/workspace-integration.dto";
import { Effect } from "effect";

import { RecountAtomClient, RecountClient } from "~/lib/rpc/atom-client";

const workspaceIntegrationsAtomReadonly = RecountAtomClient.query(
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
        provider: update.provider,
        _metadata: null,
        createdAt: new Date(),
      });

      return [...current, optimisticResponse];
    },
    fn: RecountAtomClient.runtime.fn(
      Effect.fnUntraced(function* (update) {
        return yield* RecountClient.WorkspaceIntegration.Create({
          payload: update,
        });
      })
    ),
  }
);

export const deleteWorkspaceIntegrationAtom = Atom.family((id: string) =>
  Atom.optimisticFn(workspaceIntegrationsAtom, {
    reducer: (current) => current.filter((i) => i.id !== id),
    fn: RecountAtomClient.runtime.fn(
      Effect.fnUntraced(function* () {
        return yield* RecountClient.WorkspaceIntegration.Delete({
          path: { id },
        });
      })
    ),
  })
);

const projectsAtomReadonly = RecountAtomClient.query("Project", "List", {
  reactivityKeys: ["projects"],
}).pipe(Atom.map(Result.getOrElse(() => [])), Atom.keepAlive);

export const projectsAtom = Atom.optimistic(projectsAtomReadonly);

const tasksAtomReadonly = RecountAtomClient.query("Task", "List", {
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
