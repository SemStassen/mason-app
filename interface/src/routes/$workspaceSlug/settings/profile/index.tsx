import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$workspaceSlug/settings/profile/")({
  beforeLoad: () => {
    return {
      getTitle: () => "Profile",
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <div />;
}
