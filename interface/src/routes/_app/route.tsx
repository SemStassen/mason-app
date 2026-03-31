import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AtomRegistry } from "effect/unstable/reactivity";

import { workspacesAtom } from "~/atoms/auth.atoms";
import { atomRegistry } from "~/atoms/registry";
import { runtime } from "~/lib/runtime";

import { AppProviders } from "./-app-providers";

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ context, location }) => {
    const { auth } = context;

    if (auth === null) {
      throw redirect({ to: "/sign-up" });
    }

    const workspaces = await runtime.runPromise(
      AtomRegistry.getResult(atomRegistry, workspacesAtom, {
        suspendOnWaiting: true,
      })
    );

    if (!auth.user.fullName) {
      if (!location.pathname.startsWith("/profile")) {
        throw redirect({ to: "/profile" });
      }

      return { auth, workspaces };
    }

    return { auth, workspaces };
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
