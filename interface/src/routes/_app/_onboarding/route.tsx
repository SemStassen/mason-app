import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_onboarding")({
  beforeLoad: ({ context }) => {
    if (!("user" in context) || !("session" in context)) {
      throw notFound();
    }

    return context;
  },
  component: AuthLayout,
});

function AuthLayout() {
  // const { user } = Route.useRouteContext();

  return (
    <div className="relative grid h-screen w-screen place-content-center overflow-hidden bg-background px-8 text-foreground">
      {/*{user?.activeWorkspace && (
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
      )}*/}

      <Outlet />
    </div>
  );
}
