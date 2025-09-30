import { Button } from "@mason/ui/button";
import { Icons } from "@mason/ui/icons";
import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";

export const Route = createFileRoute("/$workspaceSlug/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const matches = useRouterState({ select: (s) => s.matches });

  const matchWithTitle = [...matches]
    .reverse()
    .find((d) => "getTitle" in d.context);

  const title =
    matchWithTitle && "getTitle" in matchWithTitle.context
      ? matchWithTitle.context.getTitle()
      : "Settings";

  return (
    <div className="flex flex-1">
      <aside className="w-[240px] p-4">
        <Button
          render={(props) => (
            <Link
              from="/$workspaceSlug/settings"
              to="/$workspaceSlug"
              {...props}
            >
              <Icons.ChevronLeft />
              Back to app
            </Link>
          )}
          variant="ghost"
        />
        <div>
          <Button
            render={(props) => (
              <Link
                from="/$workspaceSlug/settings"
                to="/$workspaceSlug/settings"
                {...props}
              >
                <Icons.Slider />
                Preferences
              </Link>
            )}
            variant="ghost"
          />
          <Button
            render={(props) => (
              <Link
                from="/$workspaceSlug/settings"
                to="/$workspaceSlug/settings/profile"
                {...props}
              >
                <Icons.User />
                Profile
              </Link>
            )}
            variant="ghost"
          />
          <Button
            render={(props) => (
              <Link
                from="/$workspaceSlug/settings"
                to="/$workspaceSlug/settings/integrations"
                {...props}
              >
                <Icons.Plugs />
                Integrations
              </Link>
            )}
            variant="ghost"
          />
        </div>
      </aside>
      <div className="relative m-1 flex-1 overflow-y-scroll rounded-lg border bg-card p-4">
        <div className="mx-auto mt-16 max-w-2xl space-y-8">
          <h1 className="font-medium text-2xl">{title}</h1>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
