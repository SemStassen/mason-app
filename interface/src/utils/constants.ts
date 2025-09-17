import type { WindowActivitySnapshot } from "../../../apps/desktop/src/bindings";

type DesktopPlatform = {
  platform: "desktop";
  fetch: typeof fetch;
  openUrl: (
    url: string | URL,
    openWith?: "inAppBrowser" | string
  ) => Promise<void>;
  getCurrent: () => Promise<string[] | null>;
  onOpenUrl: (handler: (urls: string[]) => void) => Promise<() => void>;
  captureWindowActivity: () => Promise<WindowActivitySnapshot>;
};

type WebPlatform = {
  platform: "web";
};

type Platform = DesktopPlatform | WebPlatform;

export const PLATFORM: Platform =
  // biome-ignore lint/correctness/noUndeclaredVariables: Vite app env
  __PLATFORM__ === "desktop"
    ? ({
        platform: "desktop",
        fetch: window.__TAURI__.http.fetch,
        openUrl: window.__TAURI__.opener.openUrl,
        getCurrent: window.__TAURI__.deepLink.getCurrent,
        onOpenUrl: window.__TAURI__.deepLink.onOpenUrl,
        captureWindowActivity: () =>
          window.__TAURI__.core.invoke(
            "capture_window_activity"
          ) as Promise<WindowActivitySnapshot>,
      } as const)
    : ({ platform: "web" } as const);
