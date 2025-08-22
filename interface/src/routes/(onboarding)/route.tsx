import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/(onboarding)')({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="grid h-screen w-screen place-content-center overflow-hidden bg-background px-8 text-foreground">
      <Outlet />
    </div>
  );
}
