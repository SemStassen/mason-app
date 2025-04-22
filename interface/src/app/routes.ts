import { index, rootRoute, route } from "@tanstack/virtual-file-routes";

export const routes = rootRoute("root.tsx", [
  index("index.tsx"),
  route("/tracker", "tracker/index.tsx"),
  route("/projects", [
    index("projects/index.tsx"),
    route("/$projectUuid", "projects/$projectUuid/index.tsx"),
  ]),
  route("/settings", "settings/layout.tsx", [index("settings/index.tsx")]),
]);
