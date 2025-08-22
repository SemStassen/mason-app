import { MasonInterfaceRoot, PlatformProvider } from '@mason/interface';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

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
          platform: 'web',
        }}
      >
        <MasonInterfaceRoot />
      </PlatformProvider>
    </StrictMode>
  );
}
