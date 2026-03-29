import { RegistryContext } from "@effect/atom-react";
import { AnchoredToastProvider, ToastProvider } from "@mason/ui/toast";
import { TooltipProvider } from "@mason/ui/tooltip";
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  formDevtoolsPlugin,
  FormDevtoolsPanel,
} from "@tanstack/react-form-devtools";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import "./globals.css";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { HotkeysProvider } from "react-hotkeys-hook";

import { ThemeProvider } from "~/components/theme-provider";
import { ErrorPage } from "~/routes/-error";
import { NotFoundPage } from "~/routes/-not-found";

import { atomRegistry } from "./atoms/registry";
import { env } from "./lib/env";
import { routeTree } from "./routeTree.gen";

// This is required for Tanstack router to work properly
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    className?: string;
  }
}

export const router = createRouter({
  routeTree: routeTree,
  context: {},
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  defaultPendingMs: 300,
  defaultPendingMinMs: 300,
  defaultNotFoundComponent: NotFoundPage,
  defaultErrorComponent: ErrorPage,
  Wrap: ({ children }) => (
    <RegistryContext.Provider value={atomRegistry}>
      <HotkeysProvider>
        <TooltipProvider delay={100}>
          <ToastProvider>
            <AnchoredToastProvider>
              <ThemeProvider>{children}</ThemeProvider>
            </AnchoredToastProvider>
          </ToastProvider>
        </TooltipProvider>
      </HotkeysProvider>
    </RegistryContext.Provider>
  ),
});

export function renderMasonInterface() {
  const rootElement = document.querySelector("#root");

  if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <StrictMode>
        <RouterProvider router={router} />
        {env.VITE_DEV && (
          <TanStackDevtools
            plugins={[
              {
                name: "TanStack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
              {
                name: "TanStack Form",
                render: <FormDevtoolsPanel />,
              },
            ]}
          />
        )}
      </StrictMode>
    );
  }
}
