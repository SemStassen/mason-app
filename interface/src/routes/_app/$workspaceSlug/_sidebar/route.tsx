import { createFileRoute, Outlet } from "@tanstack/react-router";

import { LeftSidebar } from "./-components";
import { LeftSidebarToggle } from "./-components/left-sidebar-toggle";

export const Route = createFileRoute("/_app/$workspaceSlug/_sidebar")({
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
