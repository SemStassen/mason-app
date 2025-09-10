import { Button } from "@mason/ui/button";
import { Icons } from "@mason/ui/icons";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(onboarding)")({
  beforeLoad: ({ context }) => {
    // Simplify context type
    if (!("user" in context && context.user)) {
      return { user: undefined };
    }
    return { user: context.user };
  },
  component: AuthLayout,
});

function AuthLayout() {
  const { user } = Route.useRouteContext();

  return (
    <div className="relative grid h-screen w-screen place-content-center overflow-hidden bg-background px-8 text-foreground">
      {user?.activeWorkspace && (
        <Button
          className="fixed top-4 left-4"
          render={
            <Link
              params={{
                workspaceSlug: user.activeWorkspace?.slug,
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

      <Outlet />
    </div>
  );
}
