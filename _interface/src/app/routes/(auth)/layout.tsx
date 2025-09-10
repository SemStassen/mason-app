import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth-layout")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="grid h-screen w-screen place-content-center overflow-hidden bg-background px-8 text-foreground">
      <Outlet />
    </div>
  );
}
