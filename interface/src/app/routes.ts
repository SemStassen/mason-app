import { index, layout, rootRoute, route } from "@tanstack/virtual-file-routes";

export const routes = rootRoute("root.tsx", [
  // App
  route("/$workspaceSlug", [
    layout("app-layout", "$workspaceSlug/layout.tsx", [
      index("$workspaceSlug/index.tsx"),
      route("/tracker", "$workspaceSlug/tracker/index.tsx"),
      route("/projects", [
        index("$workspaceSlug/projects/index.tsx"),
        route("/$projectId", "$workspaceSlug/projects/$projectId/index.tsx"),
      ]),

      route("/settings", "$workspaceSlug/settings/layout.tsx", [
        index("$workspaceSlug/settings/index.tsx"),
      ]),
    ]),
  ]),
  // Auth
  layout("auth-layout", "(auth)/layout.tsx", [
    route("/sign-in", "(auth)/sign-in/index.tsx"),
    route("/sign-up", "(auth)/sign-up/index.tsx"),
  ]),
  // Onboarding
  layout("onboarding-layout", "(onboarding)/layout.tsx", [
    route("/create-workspace", "(onboarding)/create-workspace/index.tsx"),
  ]),
]);
