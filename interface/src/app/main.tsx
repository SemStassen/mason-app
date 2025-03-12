import { BrowserRouter, Route, Routes } from "react-router";
import { RootLayout } from "./routes/root-layout";

import { Providers } from "./providers";
import { RootPage } from "./routes/root-page";
import { SettingsLayout } from "./routes/settings-layout";
import { SettingsPage } from "./routes/settings-page";
import "@mason/ui/globals.css";

function MasonInterfaceRoot() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index={true} element={<RootPage />} />
            <Route element={<SettingsLayout />}>
              <Route path="/tracker" element={<div>Tracker</div>} />
              <Route path="/projects" element={<div>Projects</div>} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}

export { MasonInterfaceRoot };
