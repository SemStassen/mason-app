import { Button } from '@mason/ui/button';
import { Icons } from '@mason/ui/icons';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/$workspaceSlug/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex">
      <aside className="w-[240px] p-4">
        <Button
          render={(props) => (
            <Link
              from="/$workspaceSlug/settings/"
              to="/$workspaceSlug"
              {...props}
            >
              <Icons.ChevronLeft />
              Back to app
            </Link>
          )}
          variant="ghost"
        />
      </aside>
      <Outlet />
    </div>
  );
}
