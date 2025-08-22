import { MasonInterfaceRoot, PlatformProvider } from '@mason/interface';
import { getCurrent, onOpenUrl } from '@tauri-apps/plugin-deep-link';
import { fetch } from '@tauri-apps/plugin-http';
import { openUrl } from '@tauri-apps/plugin-opener';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { commands } from './bindings';
import { getOs } from './platform';

// biome-ignore lint/style/noNonNullAssertion: Fine for root
const rootElement = document.getElementById('root')!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}

function App() {
  return (
    <StrictMode>
      <PlatformProvider
        value={{
          platform: 'desktop',
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
        }}
      >
        <MasonInterfaceRoot />
      </PlatformProvider>
    </StrictMode>
  );
}
