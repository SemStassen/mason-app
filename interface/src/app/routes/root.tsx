import { authClient } from "@mason/auth/client";
import { Outlet, createRootRoute, redirect } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
  beforeLoad: async ({ location }) => {
    const { data } = await authClient.getSession();

    if (!data || !data?.session) {
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
  },
});

function RootLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}
