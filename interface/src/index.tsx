import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode, Suspense, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { ErrorPage } from "./routes/-error";
import { NotFoundPage } from "./routes/-not-found";
import { routeTree } from "./routeTree.gen";

import "./globals.css";
import { PLATFORM } from "./utils/constants";

// This is required for Tanstack router to work properly
declare module "@tanstack/react-router" {
  // biome-ignore lint/nursery/useConsistentTypeDefinitions: Needed here
  interface Register {
    router: typeof router;
  }
}

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFoundPage,
  defaultErrorComponent: ErrorPage,
});

export function renderMasonInterface() {
  // biome-ignore lint/style/noNonNullAssertion: Fine for root
  const rootElement = document.getElementById("root")!;

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

    function handleUrls(urls: string[]) {
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
