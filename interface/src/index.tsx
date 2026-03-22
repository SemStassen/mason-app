import { AnchoredToastProvider, ToastProvider } from "@mason/ui/toast";
import { TooltipProvider } from "@mason/ui/tooltip";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode, Suspense, useEffect } from "react";
import ReactDOM from "react-dom/client";

import "./globals.css";
import { HotkeysProvider } from "react-hotkeys-hook";

import { ThemeProvider } from "~/components/theme-provider";
import { PLATFORM } from "~/lib/utils/constants";
import { ErrorPage } from "~/routes/-error";
import { NotFoundPage } from "~/routes/-not-found";

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
    <HotkeysProvider>
      <TooltipProvider delay={100}>
        <ToastProvider>
          <AnchoredToastProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </AnchoredToastProvider>
        </ToastProvider>
      </TooltipProvider>
    </HotkeysProvider>
  ),
});

export function renderMasonInterface() {
  const rootElement = document.querySelector("#root")!;

  if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <StrictMode>
        <Suspense>
          <DeepLinkBridge />
          <RouterProvider router={router} />
        </Suspense>
      </StrictMode>
    );
  }
}

function DeepLinkBridge() {
  useEffect(() => {
    if (PLATFORM.platform !== "desktop") {
      return;
    }

    const ac = new AbortController();
    let unlisten: (() => void) | undefined;

    function handleUrls(urls: Array<string>) {
      // Re-emit as a browser CustomEvent so any part of the app can listen
      window.dispatchEvent(new CustomEvent("deep-link", { detail: urls }));
    }

    // IIFE
    (async () => {
      const current = await PLATFORM.getCurrent();
      if (current?.length) {
        handleUrls(current);
      }

      unlisten = await PLATFORM.onOpenUrl(handleUrls);
      ac.signal.addEventListener("abort", () => unlisten?.());
    })();

    return () => ac.abort();
  }, []);

  return null;
}
