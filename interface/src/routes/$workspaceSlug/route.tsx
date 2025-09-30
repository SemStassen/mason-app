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
  component: Layout,
});

function Layout() {
  const navigate = useNavigate();
  const { setTheme, theme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  useRegisterCommands(() => [
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
      <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
        <main className="flex h-full">
          <Outlet />
        </main>
        <DebugSheet />
      </div>
      <AppCommandsDialog />
    </WorkspaceProviders>
  );
}
