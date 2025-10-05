import { Toaster } from "@mason/ui/sonner";
import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { Effect } from "effect";
import { MasonClient } from "~/client";
import { AppProviders } from "./-app-providers";

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const sessionResult = await Effect.runPromise(
      MasonClient.Auth.GetSession().pipe(
        Effect.catchTags({
          Unauthorized: () => Effect.succeed(null),
          InternalServerError: () => Effect.succeed(null),
        }),
        Effect.catchAll(() => Effect.succeed(null))
      )
    );

    // If no session or user, redirect to sign-up (unless already there)
    if (!sessionResult?.user) {
      if (!["/sign-up"].includes(location.pathname)) {
        throw redirect({
          to: "/sign-up",
        });
      }
      return;
    }

    const { user, session } = sessionResult;

    // If user exists but has no workspaces, redirect to create-workspace
    // At create-workspace we show a return button when workspaces do exist.
    // So no need to check for that here
    if (user.memberships.length === 0) {
      if (!["/create-workspace"].includes(location.pathname)) {
        throw redirect({
          to: "/create-workspace",
        });
      }
      return;
    }

    const activeWorkspace = user.memberships.find(
      (membership) => membership.workspace.id === session.activeWorkspaceId
    )?.workspace;

    // This should never happen.
    // But if it does, we need to set the active workspace to the first workspace as a fallback
    if (!activeWorkspace) {
      await Effect.runPromise(
        MasonClient.Workspace.SetActive({
          payload: {
            workspaceId: user.memberships[0].workspace.id,
          },
        }).pipe(
          Effect.catchTags({
            Unauthorized: () => Effect.succeed(null),
            InternalServerError: () => Effect.succeed(null),
          }),
          Effect.catchAll(() => Effect.succeed(null))
        )
      );
      return;
    }

    if (
      !(
        location.pathname.startsWith(`/${activeWorkspace.slug}`) ||
        ["/create-workspace"].includes(location.pathname)
      )
    ) {
      throw redirect({
        to: "/$workspaceSlug",
        params: {
          workspaceSlug: activeWorkspace.slug,
        },
      });
    }

    return { user: { ...user, activeWorkspace } };
  },
  component: RootLayout,
});

function RootLayout() {
  return (
    <AppProviders>
      <Outlet />
      <Toaster />
    </AppProviders>
  );
}
