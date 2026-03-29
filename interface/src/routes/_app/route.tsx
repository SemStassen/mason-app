import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppProviders } from "./-app-providers";

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ context, location }) => {
    if (!("session" in context)) {
      throw redirect({ to: "/sign-up" });
    }

    if (!context.user.fullName) {
      if (!location.pathname.startsWith("/profile")) {
        throw redirect({ to: "/profile" });
      }

      return null;
    }

    return context;
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
