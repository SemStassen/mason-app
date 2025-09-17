import type * as app from "@tauri-apps/api";
import type * as deeplink from "@tauri-apps/plugin-deep-link";
import type * as fs from "@tauri-apps/plugin-fs";
import type * as http from "@tauri-apps/plugin-http";
import type * as opener from "@tauri-apps/plugin-opener";
import type * as os from "@tauri-apps/plugin-os";

declare global {
  // biome-ignore lint/nursery/useConsistentTypeDefinitions: Needed for global augmentation
  interface Window {
    __TAURI__: typeof app & {
      deepLink: typeof deeplink;
      fs: typeof fs;
      http: typeof http; // <-- Is this correct? Not in docs
      opener: typeof opener;
      os: typeof os;
    };
  }
}
