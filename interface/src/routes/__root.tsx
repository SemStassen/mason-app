import { Toaster } from '@mason/ui/sonner';
import { createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { masonClient } from '~/client';

export const Route = createRootRoute({
  component: RootLayout,
  beforeLoad: async ({ location }) => {
    try {
      const res = await masonClient.auth.authGetSession();
    } catch (e) {
      console.log(e);
    }

    const { user } = await res.value();

    if (!(user || ['/sign-up'].includes(location.pathname))) {
      throw redirect({
        to: '/sign-up',
      });
    }

    if (
      !(
        user.activeWorkspaceId ||
        location.pathname.includes('/create-workspace')
      )
    ) {
      // If user exists but no active workspace, redirect to create-workspace
      throw redirect({
        to: '/create-workspace',
      });
    }
  },
});

function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}
