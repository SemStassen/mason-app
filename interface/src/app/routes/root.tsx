import { authClient } from "@mason/auth/client";
import { Outlet, createRootRoute, redirect } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
  beforeLoad: async ({ location }) => {
    const { data: session } = await authClient.getSession();

    // First check if the user is authenticated
    if (!session || !session.session) {
      if (
        location.pathname === "/sign-in" ||
        location.pathname === "/sign-up"
      ) {
        return;
      }

      throw redirect({
        to: "/sign-in",
        search: {
          redirect: location.href,
        },
      });
    }

    // Then check if the user has an organization
    const { data: workspaces } = await authClient.organization.list();

    if (!workspaces || workspaces.length === 0) {
      if (location.pathname === "/create-workspace") {
        return;
      }

      throw redirect({
        to: "/create-workspace",
      });
    }

    if (location.pathname.includes(workspaces[0].slug)) {
      return;
    }

    throw redirect({
      to: "/$workspaceSlug",
      params: {
        workspaceSlug: workspaces[0].slug,
      },
    });
  },
});

function RootLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}
