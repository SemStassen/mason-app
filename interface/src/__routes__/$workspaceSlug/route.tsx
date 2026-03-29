import { useTheme } from "@mason/ui/theme-provider";
import {
  createFileRoute,
  notFound,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { useCallback } from "react";

import {
  AppCommandsDialog,
  useRegisterCommands,
} from "~/components/app-commands-dialog";
import { getPgliteInstance, startFeatureSync } from "~/db";

import { DebugSheet } from "./-components/debug-sheet";
import { WorkspaceProviders } from "./-components/workspace-providers";

export const Route = createFileRoute("/$workspaceSlug")({
  beforeLoad: ({ context }) => {
    // Simplify context type
    if (!("user" in context && context.user)) {
      throw notFound();
    }
    return { user: context.user };
  },
  loader: async ({ location }) => {
    const db = getPgliteInstance();
    const workspaceSlug = location.pathname
      .split("/")
      .find((part) => part.length > 0);

    if (!workspaceSlug) {
      throw notFound();
    }

    const workspaceResult = await db.query<{ id: string }>(
      `SELECT id FROM workspaces WHERE slug = $1 LIMIT 1`,
      [workspaceSlug]
    );

    const workspaceId = workspaceResult.rows.at(0)?.id;

    if (!workspaceId) {
      throw notFound();
    }

    await startFeatureSync(db, { workspaceId });
  },
  pendingComponent: WorkspaceLoadingScreen,
  component: Layout,
});

function WorkspaceLoadingScreen() {
  return (
    <div className="grid h-screen w-screen place-content-center bg-background px-8 text-foreground">
      <p className="text-sm text-muted-foreground" role="status">
        Loading workspace…
      </p>
    </div>
  );
}

function Layout() {
  const navigate = useNavigate();
  const { setTheme, theme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  useRegisterCommands(() => [
    {
      title: "Open settings…",
      value: "open-settings",
      category: "navigation",
      subCommands: () => [
        {
          title: "Preferences",
          value: "preferences",
          category: "navigation",
          onSelect: (dialog) => {
            navigate({
              to: "/$workspaceSlug/settings",
              from: "/$workspaceSlug",
            });
            dialog.close();
          },
        },
        {
          title: "Profile",
          value: "profile",
          category: "navigation",
          onSelect: (dialog) => {
            navigate({
              to: "/$workspaceSlug/settings/profile",
              from: "/$workspaceSlug",
            });
            dialog.close();
          },
        },
        {
          title: "Integrations",
          value: "integrations",
          category: "navigation",
          onSelect: (dialog) => {
            navigate({
              to: "/$workspaceSlug/settings/integrations",
              from: "/$workspaceSlug",
            });
            dialog.close();
          },
        },
      ],
    },
    {
      title: "Go to tracker",
      value: "go-to-tracker",
      hotkey: "g>t",
      category: "navigation",
      onSelect: (dialog) => {
        navigate({ to: "/$workspaceSlug", from: "/$workspaceSlug" });
        dialog.close();
      },
    },
    {
      title: "Go to projects",
      value: "go-to-projects",
      hotkey: "g>p",
      category: "navigation",
      onSelect: (dialog) => {
        navigate({ to: "/$workspaceSlug/projects", from: "/$workspaceSlug" });
        dialog.close();
      },
    },
    {
      title: "Go to settings",
      value: "go-to-settings",
      hotkey: "g>s",
      category: "navigation",
      onSelect: (dialog) => {
        navigate({ to: "/$workspaceSlug/settings", from: "/$workspaceSlug" });
        dialog.close();
      },
    },
    {
      title: theme === "dark" ? "Toggle light mode" : "Toggle dark mode",
      value: theme === "dark" ? "toggle-light-mode" : "toggle-dark-mode",
      category: "settings",
      onSelect: (dialog) => {
        toggleTheme();
        dialog.close();
      },
    },
  ]);

  return (
    <WorkspaceProviders>
      <div className="isolate h-screen w-screen overflow-hidden overscroll-none bg-background text-foreground">
        <main className="flex h-full">
          <Outlet />
        </main>
        <DebugSheet />
      </div>
      <AppCommandsDialog />
    </WorkspaceProviders>
  );
}
