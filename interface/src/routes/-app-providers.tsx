import { ThemeProvider } from '@mason/ui/theme-provider';
import { TooltipProvider } from '@mason/ui/tooltip';
import type { PropsWithChildren } from 'react';

function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider defaultTheme="system">
      <TooltipProvider delay={100}>{children}</TooltipProvider>
    </ThemeProvider>
  );
}

export { AppProviders };
