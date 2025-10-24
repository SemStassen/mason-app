import { useAtomValue } from "@effect-atom/atom-react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { projectsWithTasksAtom } from "~/atoms/api";
import { ProjectsTable } from "./-components/projects-table";
import { RightSidebar } from "./-components/right-sidebar";

export const Route = createFileRoute(
  "/$workspaceSlug/(with-sidebar)/projects/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  const selectedProject = useAtomValue(
    projectsWithTasksAtom,
    (projects) =>
      projects.find((project) => project.id === selectedProjectId) ?? null
  );

  return (
    <>
      <div className="w-full p-8">
        <h1 className="font-semibold text-2xl">Projects</h1>
        <ProjectsTable onSelectProject={setSelectedProjectId} />
      </div>
      <RightSidebar
        onClose={() => setSelectedProjectId(null)}
        selectedProject={selectedProject}
      />
    </>
  );
}
