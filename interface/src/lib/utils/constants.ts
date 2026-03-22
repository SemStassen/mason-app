interface DesktopPlatform {
  platform: "desktop";
  fetch: typeof fetch;
  openUrl: (
    url: string | URL,
    openWith?: "inAppBrowser" | string
  ) => Promise<void>;
  getCurrent: () => Promise<Array<string> | null>;
  onOpenUrl: (handler: (urls: Array<string>) => void) => Promise<() => void>;
}

interface WebPlatform {
  platform: "web";
}

type Platform = DesktopPlatform | WebPlatform;

export const PLATFORM: Platform =
  __PLATFORM__ === "desktop"
    ? ({
        platform: "desktop",
        fetch: window.__TAURI__.http.fetch,
        openUrl: window.__TAURI__.opener.openUrl,
        getCurrent: window.__TAURI__.deepLink.getCurrent,
        onOpenUrl: window.__TAURI__.deepLink.onOpenUrl,
      } as const)
    : ({ platform: "web" } as const);
