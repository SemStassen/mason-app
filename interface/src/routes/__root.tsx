import { Toaster } from '@mason/ui/sonner';
import {
  createRootRouteWithContext,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { Effect } from 'effect';
import { createMasonClient } from '~/client';
import type { Platform } from '~/utils/Platform';
import { AppProviders } from './-app-providers';

export const Route = createRootRouteWithContext<{
  platform: Platform;
}>()({
  component: RootLayout,
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
      if (!['/sign-up'].includes(location.pathname)) {
        throw redirect({
          to: '/sign-up',
        });
      }
      return;
    }
    const { user } = sessionResult;
    // If user exists but no active workspace, redirect to create-workspace
    if (!user.activeWorkspaceSlug) {
      if (!['/create-workspace'].includes(location.pathname)) {
        throw redirect({
          to: '/create-workspace',
        });
      }
      return;
    }
    if (!location.pathname.startsWith(`/${user.activeWorkspaceSlug}`)) {
      throw redirect({
        to: '/$workspaceSlug',
        params: {
          workspaceSlug: user.activeWorkspaceSlug,
        },
      });
    }
  },
});

function RootLayout() {
  return (
    <AppProviders>
      <Outlet />
      <Toaster />
    </AppProviders>
  );
}
