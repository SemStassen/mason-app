import { createFileRoute, Outlet } from '@tanstack/react-router';
import { DebugSheet } from './-components/debug-sheet';
import { WorkspaceProviders } from './-components/workspace-providers';

export const Route = createFileRoute('/$workspaceSlug')({
  component: Layout,
});

function Layout() {
  return (
    <WorkspaceProviders>
      <div className="h-screen w-screen bg-background text-foreground">
        <main className="flex h-full">
          <Outlet />
        </main>
        <DebugSheet />
      </div>
    </WorkspaceProviders>
  );
}
