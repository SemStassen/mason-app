declare const __PLATFORM__: "web" | "desktop";

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_ELECTRIC_PROXY_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
