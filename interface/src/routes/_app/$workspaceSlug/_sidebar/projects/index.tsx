import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";

import { projectsCollection } from "~/db/collections";

export const Route = createFileRoute("/_app/$workspaceSlug/_sidebar/projects/")(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  const { data: projects } = useLiveQuery((q) =>
    q.from({ p: projectsCollection })
  );

  return <div>Hello "/_app/$workspaceSlug/_sidebar/projects/"!</div>;
}
