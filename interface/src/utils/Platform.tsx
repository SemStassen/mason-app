import { createContext, type PropsWithChildren, useContext } from 'react';
import type { WindowActivitySnapshot } from '../../../apps/desktop/src/bindings';

type ProxyConfig = {
  url: string;
  basicAuth?: {
    username: string;
    password: string;
  };
  noProxy?: string;
};

type PlatformWeb = {
  platform: 'web';
};

type PlatformDesktop = {
  platform: 'desktop';
  // OS
  getOs: () => 'browser' | 'linux' | 'macOS' | 'windows' | 'unknown';
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
    }
  ) => Promise<Response>;
  // Opener
  openUrl: (
    url: string | URL,
    openWith?: 'inAppBrowser' | string
  ) => Promise<void>;
  // Deep Linking
  getCurrent: () => Promise<string[] | null>;
  onOpenUrl: (handler: (urls: string[]) => void) => Promise<() => void>;
  // Custom
  captureWindowActivity: () => Promise<WindowActivitySnapshot>;
};

export type Platform = PlatformWeb | PlatformDesktop;

const PlatformContext = createContext<Platform | undefined>(undefined);

export function usePlatform(): Platform {
  const ctx = useContext(PlatformContext);
  if (!ctx) {
    throw new Error(
      "The 'PlatformProvider' has not been mounted above the current 'usePlatform' call."
    );
  }

  return ctx;
}

export function PlatformProvider({
  value,
  children,
}: PropsWithChildren<{ value: Platform }>) {
  return <PlatformContext value={value}>{children}</PlatformContext>;
}
