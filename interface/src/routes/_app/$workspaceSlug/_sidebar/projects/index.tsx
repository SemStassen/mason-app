import { createFileRoute } from "@tanstack/react-router";

import { useWorkspaceLiveQuery } from "~/db/use-workspace-live-query";

export const Route = createFileRoute("/_app/$workspaceSlug/_sidebar/projects/")(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  const { data: projects } = useWorkspaceLiveQuery((q, db) =>
    q.from({ project: db.projectsCollection })
  );

  return <div>{projects?.length ?? 0} projects</div>;
}
