import {
  createFileRoute,
  notFound,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";

import { DebugSheet } from "./-components/debug-sheet";

export const Route = createFileRoute("/_app/$workspaceSlug")({
  beforeLoad: ({ context }) => {
    // Simplify context type
    if (!("user" in context && context.user)) {
      throw notFound();
    }
    return { user: context.user };
  },
  component: WorkspaceLayout,
});

function WorkspaceLayout() {
  const navigate = useNavigate();

  return (
    <div className="isolate h-screen w-screen overflow-hidden overscroll-none bg-background text-foreground">
      <main className="flex h-full">
        <Outlet />
      </main>
      <DebugSheet />
    </div>
  );
}
