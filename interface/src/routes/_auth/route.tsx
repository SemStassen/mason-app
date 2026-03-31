import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ context }) => {
    if (context.auth !== null) {
      throw redirect({ to: "/" });
    }

    return context;
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="grid h-screen w-screen place-content-center overflow-hidden bg-background px-8 text-foreground">
      <Outlet />
    </div>
  );
}
