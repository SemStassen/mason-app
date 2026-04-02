import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/$workspaceSlug/settings/integrations_")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Button
        className="absolute top-4 left-4"
        render={
          <Link
            from="/$workspaceSlug/settings/integrations"
            to="/$workspaceSlug/settings/integrations"
          />
        }
        variant="ghost"
      >
        <Icons.ArrowLeft /> Integrations
      </Button>
      <Outlet />
    </>
  );
}
