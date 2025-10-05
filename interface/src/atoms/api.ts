import { Atom, Result } from "@effect-atom/atom-react";
import {
  type UpsertWorkspaceIntegrationRequest,
  WorkspaceIntegrationResponse,
} from "@mason/api-contract/dto/workspace-integration.dto";
import { Effect } from "effect";
import { MasonAtomClient, MasonClient } from "~/client";

const workspaceIntegrationsAtomReadonly = MasonAtomClient.runtime
  .atom(MasonClient.WorkspaceIntegrations.List())
  .pipe(Atom.map(Result.getOrElse(() => [])));

export const workspaceIntegrationsAtom = Atom.optimistic(
  workspaceIntegrationsAtomReadonly
);

export const upsertWorkspaceIntegrationAtom = Atom.optimisticFn(
  workspaceIntegrationsAtom,
  {
    reducer: (
      current,
      update: typeof UpsertWorkspaceIntegrationRequest.Type
    ) => {
      const optimisticResponse = WorkspaceIntegrationResponse.make({
        id: crypto.randomUUID(),
        workspaceId: "temp",
        kind: update.kind,
      });

      return [...current, optimisticResponse];
    },
    fn: MasonAtomClient.runtime.fn(
      Effect.fnUntraced(function* (update) {
        return yield* MasonClient.WorkspaceIntegrations.Upsert({
          payload: update,
        });
      })
    ),
  }
);

export const deleteWorkspaceIntegrationAtom = Atom.family((id: string) =>
  Atom.optimisticFn(workspaceIntegrationsAtom, {
    reducer: (current) => {
      return current.filter((i) => i.id !== id);
    },
    fn: MasonAtomClient.runtime.fn(
      Effect.fnUntraced(function* () {
        return yield* MasonClient.WorkspaceIntegrations.Delete({
          path: { id },
        });
      })
    ),
  })
);
