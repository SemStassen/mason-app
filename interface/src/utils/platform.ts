import type { WindowActivitySnapshot } from "../../../apps/desktop/src/bindings";

type ProxyConfig = {
  url: string;
  basicAuth?: {
    username: string;
    password: string;
  };
  noProxy?: string;
};

type PlatformDesktop = {
  platform: "desktop";
  // OS
  getOs: () => "linux" | "windows" | "macOS" | "unknown";
  // HTTP Client
  fetch: (
    input: URL | Request | string,
    init?: RequestInit & {
      maxRedirections?: number;
      connectTimeout?: number;
      proxy?: {
        all?: string | ProxyConfig;
        http?: string | ProxyConfig;
        https?: string | ProxyConfig;
      };
      danger?: {
        acceptInvalidCerts?: boolean;
        acceptInvalidHostnames?: boolean;
      };
    }
  ) => Promise<Response>;
  // Opener
  openUrl: (
    url: string | URL,
    openWith?: "inAppBrowser" | string
  ) => Promise<void>;
  // Deep Linking
  getCurrent: () => Promise<string[] | null>;
  onOpenUrl: (handler: (urls: string[]) => void) => Promise<() => void>;
  // Custom
  captureWindowActivity: () => Promise<WindowActivitySnapshot>;
};

type PlatformWeb = {
  platform: "web";
};

export type Platform = PlatformWeb | PlatformDesktop;
