import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LeftSidebar } from "./-components/left-sidebar";
import { LeftSidebarToggle } from "./-components/left-sidebar/left-sidebar-toggle";

export const Route = createFileRoute("/$workspaceSlug/(with-sidebar)")({
  component: Layout,
});

function Layout() {
  return (
    <>
      <div className="relative">
        <LeftSidebar />
        <div className="absolute top-1.5 left-1.5">
          <LeftSidebarToggle />
        </div>
      </div>
      <Outlet />
    </>
  );
}
