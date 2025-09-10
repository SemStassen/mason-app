import { Toaster } from "@mason/ui/sonner";
import {
  createRootRouteWithContext,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { Effect } from "effect";
import { createMasonClient } from "~/client";
import type { Platform } from "~/utils/platform";
import { AppProviders } from "./-app-providers";

export const Route = createRootRouteWithContext<{
  platform: Platform;
}>()({
  beforeLoad: async ({ location, context }) => {
    const MasonClient = createMasonClient(context.platform);

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

    const { user } = sessionResult;

    // If user exists but has no workspaces, redirect to create-workspace
    // At create-workspace we show a return button when workspaces do exist.
    // So no need to check for that here
    if (user.workspaces.length === 0) {
      if (!["/create-workspace"].includes(location.pathname)) {
        throw redirect({
          to: "/create-workspace",
        });
      }
      return;
    }

    const activeWorkspace = user.activeWorkspace || user.workspaces[0];

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

    return { user };
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
