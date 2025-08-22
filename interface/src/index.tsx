import { createRouter, RouterProvider } from '@tanstack/react-router';
import { useEffect } from 'react';
import { ErrorPage } from './routes/-error';
import { NotFoundPage } from './routes/-not-found';
import { routeTree } from './routeTree.gen';

import './globals.css';

export { PlatformProvider } from './utils/Platform';

import { usePlatform } from './utils/Platform';

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFoundPage,
  defaultErrorComponent: ErrorPage,
  context: {
    // biome-ignore lint/style/noNonNullAssertion: Actually safe
    platform: undefined!,
  },
});

// This is required for Tanstack router to work properly
declare module '@tanstack/react-router' {
  // biome-ignore lint/nursery/useConsistentTypeDefinitions: Needed here
  interface Register {
    router: typeof router;
  }
}

export function MasonInterfaceRoot() {
  const platform = usePlatform();

  return (
    <>
      <DeepLinkBridge />
      <RouterProvider
        context={{
          platform: platform,
        }}
        router={router}
      />
    </>
  );
}

function DeepLinkBridge() {
  const platform = usePlatform();

  useEffect(() => {
    if (platform.platform !== 'desktop') {
      return;
    }

    const ac = new AbortController();
    let unlisten: (() => void) | undefined;

    function handleUrls(urls: string[]) {
      // Re-emit as a browser CustomEvent so any part of the app can listen
      window.dispatchEvent(new CustomEvent('deep-link', { detail: urls }));
    }

    // IIFE
    (async () => {
      const current = await platform.getCurrent();
      if (current?.length) {
        handleUrls(current);
      }

      unlisten = await platform.onOpenUrl(handleUrls);
      ac.signal.addEventListener('abort', () => unlisten?.());
    })();

    return () => ac.abort();
  }, [platform]);

  return null;
}
