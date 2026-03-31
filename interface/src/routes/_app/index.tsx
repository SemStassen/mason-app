import { createFileRoute, redirect } from "@tanstack/react-router";
import { Effect, Option } from "effect";

import { MasonAtomRpcClient } from "~/lib/rpc/atom-client";
import { runtime } from "~/lib/runtime";

export const Route = createFileRoute("/_app/")({
  beforeLoad: async ({ context }) => {
    const workspaces = await runtime.runPromise(
      Effect.gen(function* () {
        const client = yield* MasonAtomRpcClient;

        return yield* client("Workspace.List", undefined);
      })
    );

    if (workspaces.length === 0) {
      throw redirect({ to: "/create-workspace" });
    }

    const lastActiveWorkspaceId = Option.getOrUndefined(
      context.auth.session.lastActiveWorkspaceId
    );

    const targetWorkspace =
      workspaces.find((workspace) => workspace.id === lastActiveWorkspaceId) ??
      workspaces[0];

    throw redirect({
      to: "/$workspaceSlug",
      params: {
        workspaceSlug: targetWorkspace.slug,
      },
    });
  },
});
