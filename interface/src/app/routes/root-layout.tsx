import { Toaster } from "@mason/ui/toaster";
import { Outlet } from "react-router";
import { Inspector } from "~/components/inspector";
import { Sidebar, SidebarToggle } from "~/components/sidebar";

function RootLayout() {
  return (
    <>
      <div className="overflow-hidden h-screen w-screen overscroll-x-none bg-background text-foreground">
        <div className="relative h-full w-full flex">
          <Sidebar />
          <div className="absolute top-2 left-2">
            <SidebarToggle />
          </div>
          <Outlet />
        </div>
      </div>
      <Toaster />
      <Inspector />
    </>
  );
}

export { RootLayout };
