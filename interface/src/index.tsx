import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { ErrorPage } from "./routes/-error";
import { NotFoundPage } from "./routes/-not-found";
import { routeTree } from "./routeTree.gen";

import "./globals.css";

import { Layer } from "effect";
import { LedgerService } from "./core/services/ledger";
import { PlatformService } from "./core/services/platform";
import type { Platform } from "./utils/platform";

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
  context: {
    // biome-ignore lint/style/noNonNullAssertion: Actually safe
    platform: undefined!,
  },
});

export let appLayer: Layer.Layer<LedgerService | PlatformService, never, never>;

// TODO: What if I return applayer from the renderMasonInteface function???
// Maybe???
export function renderMasonInterface({ platform }: { platform: Platform }) {
  appLayer = LedgerService.Default.pipe(
    Layer.provideMerge(PlatformService.live(platform))
  );

  // const appRuntime = Effect.runSync(Effect.scoped(Layer.toRuntime(appLayer)));

  // biome-ignore lint/style/noNonNullAssertion: Fine for root
  const rootElement = document.getElementById("root")!;

  if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <StrictMode>
        <DeepLinkBridge platform={platform} />
        <RouterProvider
          context={{
            platform: platform,
          }}
          router={router}
        />
      </StrictMode>
    );
  }
}

function DeepLinkBridge({ platform }: { platform: Platform }) {
  useEffect(() => {
    if (platform.platform !== "desktop") {
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
      const current = await platform.getCurrent();
      if (current?.length) {
        handleUrls(current);
      }

      unlisten = await platform.onOpenUrl(handleUrls);
      ac.signal.addEventListener("abort", () => unlisten?.());
    })();

    return () => ac.abort();
  }, [platform]);

  return null;
}
