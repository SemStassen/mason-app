import { DragDropProvider } from '@dnd-kit/react';
import type { PropsWithChildren } from 'react';

function DndProvider({ children }: PropsWithChildren) {
  return <DragDropProvider>{children}</DragDropProvider>;
}

export { DndProvider };
