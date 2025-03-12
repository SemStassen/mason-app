import { Outlet } from "@tanstack/react-router";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  return (
    <div className="max-w-2xl mx-auto w-full px-10 py-16">
      <Outlet />
    </div>
  );
}
