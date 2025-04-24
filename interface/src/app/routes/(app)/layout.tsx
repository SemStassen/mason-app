import { Toaster } from "@mason/ui/sonner";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Inspector } from "~/components/inspector";
import { Sidebar, SidebarToggle } from "~/components/sidebar";
import { Providers } from "./providers";

export const Route = createRootRoute({
  component: AppLayout,
});

function AppLayout() {
  return (
    <Providers>
      <div className="h-screen w-screen overflow-hidden overscroll-x-none bg-background text-foreground">
        <div className="relative flex h-full w-full">
          <Sidebar />
          <div className="absolute top-2 left-3">
            <SidebarToggle />
          </div>
          <Outlet />
        </div>
      </div>
      <Toaster />
      <Inspector />
    </Providers>
  );
}
