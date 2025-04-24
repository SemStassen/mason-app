import { index, layout, rootRoute, route } from "@tanstack/virtual-file-routes";

export const routes = rootRoute("root.tsx", [
  layout("app-layout", "(app)/layout.tsx", [
    index("(app)/index.tsx"),
    route("/tracker", "(app)/tracker/index.tsx"),
    route("/projects", [
      index("(app)/projects/index.tsx"),
      route("/$projectUuid", "(app)/projects/$projectUuid/index.tsx"),
    ]),

    route("/settings", "(app)/settings/layout.tsx", [
      index("(app)/settings/index.tsx"),
    ]),
  ]),
  layout("auth-layout", "(auth)/layout.tsx", [
    route("/sign-in", "(auth)/sign-in/index.tsx"),
    route("/sign-up", "(auth)/sign-up/index.tsx"),
  ]),
]);
