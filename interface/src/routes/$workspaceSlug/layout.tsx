import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/$workspaceSlug/layout')({
  component: Layout,
});

function Layout() {
  return (
    <div className="h-screen w-screen bg-background text-foreground">
      <main className="flex h-full">
        <Outlet />
      </main>
    </div>
  );
}
