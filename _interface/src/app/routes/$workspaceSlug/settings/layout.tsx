import { Outlet } from "@tanstack/react-router";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$workspaceSlug/_app-layout/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  return (
    <div className="mx-auto w-full max-w-2xl px-10 py-16">
      <Outlet />
    </div>
  );
}
