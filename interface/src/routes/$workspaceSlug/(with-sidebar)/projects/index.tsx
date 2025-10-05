import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/$workspaceSlug/(with-sidebar)/projects/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-8">
      <h1 className="font-semibold text-2xl">Projects</h1>
    </div>
  );
}
