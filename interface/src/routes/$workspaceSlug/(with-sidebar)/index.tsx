import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "./-components/calendar";

export const Route = createFileRoute("/$workspaceSlug/(with-sidebar)/")({
  component: () => {
    return <Calendar />;
  },
});
