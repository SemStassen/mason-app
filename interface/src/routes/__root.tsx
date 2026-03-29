import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { Effect } from "effect";
import { AtomRegistry } from "effect/unstable/reactivity";

import { sessionAtom } from "~/atoms/auth";
import { atomRegistry } from "~/atoms/registry";
import { runtime } from "~/lib/runtime";

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const session = await runtime.runPromise(
      AtomRegistry.getResult(atomRegistry, sessionAtom, {
        suspendOnWaiting: true,
      }).pipe(
        Effect.catchTags({
          Unauthorized: () => Effect.succeed(null),
        })
      )
    );

    // If no session or user, redirect to sign-up (unless already there)
    if (!session) {
      if (!["/sign-up"].includes(location.pathname)) {
        throw redirect({
          to: "/sign-up",
        });
      }

      return null;
    }

    return session;
  },
  component: RootLayout,
});

function RootLayout() {
  return <Outlet />;
}
