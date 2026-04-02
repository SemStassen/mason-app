import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
import { useTheme } from "@recount/ui/theme-provider";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";

export const Route = createFileRoute("/$workspaceSlug/settings/")({
  beforeLoad: () => ({
    getTitle: () => "Preferences",
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { setTheme, theme } = useTheme();
  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <div>
      <Button onClick={toggleTheme} variant="ghost">
        <Icons.Moon className="dark:hidden" />
        <Icons.Sun className="hidden dark:block" />
        <span>Toggle theme</span>
      </Button>
    </div>
  );
}
