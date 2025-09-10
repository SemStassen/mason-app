import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "./-components/calendar";

export const Route = createFileRoute("/$workspaceSlug/(with-sidebar)/")({
  component: () => {
    return (
      <div className="flex-1">
        <Calendar />
      </div>
    );
  },
});
