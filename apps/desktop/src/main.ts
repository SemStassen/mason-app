import { renderMasonInterface } from "@mason/interface";
import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { fetch } from "@tauri-apps/plugin-http";
import { openUrl } from "@tauri-apps/plugin-opener";
import { commands } from "./bindings";
import { getOs } from "./platform";

renderMasonInterface({
  platform: {
    platform: "desktop",
    // OS
    getOs: getOs,
    // Http Client
    fetch: fetch,
    // Opener
    openUrl: openUrl,
    // Deep Linking
    getCurrent: getCurrent,
    onOpenUrl: onOpenUrl,
    // Custom
    ...commands,
  },
});
