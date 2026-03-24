import type { PropsWithChildren } from "react";

import { db, PGliteProvider } from "~/db";

function WorkspaceProviders({ children }: PropsWithChildren) {
  return <PGliteProvider db={db}>{children}</PGliteProvider>;
}

export { WorkspaceProviders };
