import { authClient } from "@mason/auth/client";
import { clientEnv } from "@mason/env/client";
import { Outlet, createRootRoute, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { rootStore } from "~/stores/root-store";

export const Route = createRootRoute({
  component: RootLayout,
  beforeLoad: async ({ location }) => {
    const { isLoggedIn } = await authClient.masonCheckAuthStatus({});

    if (!isLoggedIn) {
      const isAuthRoute = ["/sign-in", "/sign-up"].includes(location.pathname);
      if (isAuthRoute) return;

      throw redirect({
        to: "/sign-in",
        search: {
          redirect: location.href,
        },
      });
    }

    // Check if the user has a workspace
    const { activeWorkspaceId, userId } = rootStore.appStore;

    if (!userId) {
      const { data: session } = await authClient.getSession();

      if (!session) {
        throw redirect({
          to: "/sign-in",
          search: {
            redirect: location.href,
          },
        });
      }

      rootStore.appStore.setUserId(session.session.userId);
    }

    if (!activeWorkspaceId) {
      const { data: workspaces } = await authClient.organization.list();

      if (!workspaces || workspaces.length === 0) {
        if (location.pathname === "/create-workspace") {
          return;
        }

        throw redirect({
          to: "/create-workspace",
        });
      }

      for (const workspace of workspaces) {
        rootStore.appStore.addWorkspaceId(workspace.id);
      }
      rootStore.appStore.setActiveWorkspaceId(workspaces[0].id);
    }

    if (location.pathname.includes(rootStore.appStore.activeWorkspaceId)) {
      return;
    }

    throw redirect({
      to: "/$workspaceSlug",
      params: {
        workspaceSlug: rootStore.appStore.activeWorkspaceId,
      },
    });
  },
});

function RootLayout() {
  const showDevTools = clientEnv.MODE === "development";

  return (
    <>
      <Outlet />
      {showDevTools && <TanStackRouterDevtools />}
    </>
  );
}
