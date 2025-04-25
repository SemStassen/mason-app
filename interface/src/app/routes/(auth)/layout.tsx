import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth-layout")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
      <Outlet />
    </div>
  );
}
