import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Effect, Option } from "effect";

import { MasonAtomRpcClient } from "~/lib/rpc/atom-client";
import { runtime } from "~/lib/runtime";

import { AppProviders } from "./-app-providers";

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ context, location, params }) => {
    if (!("session" in context)) {
      throw redirect({ to: "/sign-up" });
    }

    if (!context.user.fullName) {
      if (!["/profile"].includes(location.pathname)) {
        throw redirect({ to: "/profile" });
      }

      return null;
    }

    const workspaces = await runtime.runPromise(
      Effect.gen(function* () {
        const client = yield* MasonAtomRpcClient;

        return yield* client("Workspace.List", undefined);
      }).pipe(Effect.catch(() => Effect.succeed(null)))
    );

    if (!workspaces) {
      throw new Error("No workspaces found");
    }

    if (workspaces.length === 0) {
      if (!["/create-workspace"].includes(location.pathname)) {
        throw redirect({ to: "/create-workspace" });
      }

      return null;
    }

    const lastActiveWorkspace =
      workspaces.find(
        (workspace) =>
          Option.some(workspace.id) === context.session.lastActiveWorkspaceId
      ) ?? workspaces[0];

    if (!params.workspaceSlug) {
      throw redirect({
        to: "/$workspaceSlug",
        params: {
          workspaceSlug: lastActiveWorkspace.slug,
        },
      });
    }

    return { ...context, workspaces };
  },

  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  );
}
