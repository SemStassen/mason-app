import type { PropsWithChildren } from "react";

import { AppCommandsProvider } from "~/components/app-commands-dialog";

function AppProviders({ children }: PropsWithChildren) {
  return <AppCommandsProvider>{children}</AppCommandsProvider>;
}

export { AppProviders };
