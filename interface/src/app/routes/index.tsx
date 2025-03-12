import { createFileRoute } from "@tanstack/react-router";
import { Tracker } from "~/components/tracker";

export const Route = createFileRoute("/")({
  component: Tracker,
});
