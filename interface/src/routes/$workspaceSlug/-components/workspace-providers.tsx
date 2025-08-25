import type { PropsWithChildren } from 'react';
import { db, PGliteProvider } from '~/core/db';

function WorkspaceProviders({ children }: PropsWithChildren) {
  return <PGliteProvider db={db}>{children}</PGliteProvider>;
}

export { WorkspaceProviders };
