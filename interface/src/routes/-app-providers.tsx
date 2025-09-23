import { ThemeProvider } from "@mason/ui/theme-provider";
import { TooltipProvider } from "@mason/ui/tooltip";
import type { PropsWithChildren } from "react";
import { AppCommandsProvider } from "~/components/app-commands-dialog";

function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider defaultTheme="system">
      <TooltipProvider delay={100}>
        <AppCommandsProvider>{children}</AppCommandsProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export { AppProviders };
