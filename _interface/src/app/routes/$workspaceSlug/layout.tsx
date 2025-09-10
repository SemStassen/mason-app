import { Toaster } from "@mason/ui/sonner";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Inspector } from "~/components/inspector";
import { Sidebar, SidebarToggle } from "~/components/sidebar";
import { Providers } from "./providers";

export const Route = createFileRoute("/$workspaceSlug/_app-layout")({
  component: AppLayout,
  beforeLoad: async ({ location }) => {},
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
