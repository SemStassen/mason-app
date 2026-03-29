import type { PropsWithChildren } from "react";

import { getPgliteInstance, PGliteProvider } from "~/db";

function WorkspaceProviders({ children }: PropsWithChildren) {
  const db = getPgliteInstance();

  return <PGliteProvider db={db}>{children}</PGliteProvider>;
}

export { WorkspaceProviders };
