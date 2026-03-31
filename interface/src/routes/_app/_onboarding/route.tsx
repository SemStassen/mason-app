import { Button } from "@mason/ui/button";
import { Icons } from "@mason/ui/icons";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Option } from "effect";

export const Route = createFileRoute("/_app/_onboarding")({
  beforeLoad: ({ context }) => {
    const activeWorkspaceId = Option.getOrUndefined(
      context.auth.session.lastActiveWorkspaceId
    );

    return {
      activeWorkspace:
        context.workspaces.find((workspace) => workspace.id === activeWorkspaceId) ??
        null,
      session: context.auth.session,
      user: context.auth.user,
    };
  },
  component: AuthLayout,
});

function AuthLayout() {
  const { activeWorkspace, user } = Route.useRouteContext();

  return (
    <div className="relative grid h-screen w-screen place-content-center overflow-hidden bg-background px-8 text-foreground">
      {activeWorkspace && (
        <Button
          className="fixed top-4 left-4"
          render={
            <Link
              params={{
                workspaceSlug: activeWorkspace.slug,
              }}
              to="/$workspaceSlug"
            />
          }
          variant="ghost"
        >
          <Icons.ChevronLeft />
          Return to Mason
        </Button>
      )}
      <p className="fixed top-4 right-4 text-muted-foreground text-sm">
        You are already logged in as <span className="text-foreground">{user.email}</span>
      </p>

      <Outlet />
    </div>
  );
}
