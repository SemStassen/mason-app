import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

import { DebugSheet } from "./-components/debug-sheet";

export const Route = createFileRoute("/_app/$workspaceSlug")({
  beforeLoad: ({ context, params }) => {
    const workspace = context.workspaces.find(
      (w) => w.slug === params.workspaceSlug
    );

    if (!workspace) {
      throw notFound();
    }

    return {
      session: context.auth.session,
      user: context.auth.user,
      workspaces: context.workspaces,
      workspace,
    };
  },
  component: WorkspaceLayout,
});

function WorkspaceLayout() {
  return (
    <div className="isolate h-screen w-screen overflow-hidden overscroll-none bg-background text-foreground">
      <main className="flex h-full">
        <Outlet />
      </main>
      <DebugSheet />
    </div>
  );
}
