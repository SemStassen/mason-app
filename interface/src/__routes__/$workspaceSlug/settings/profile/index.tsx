import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$workspaceSlug/settings/profile/")({
  beforeLoad: () => ({
    getTitle: () => "Profile",
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <div />;
}
