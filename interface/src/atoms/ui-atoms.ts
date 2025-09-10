import { AtomRef } from '@effect-atom/atom-react';

export const debugSheetAtom = AtomRef.make({ isOpen: false });
export function toggleDebugSheet() {
  debugSheetAtom.update(({ isOpen }) => ({ isOpen: !isOpen }));
}

export const leftSidebarAtom = AtomRef.make({ isOpen: true });
export function toggleLeftSidebar() {
  leftSidebarAtom.update(({ isOpen }) => ({ isOpen: !isOpen }));
}

export const rightSidebarAtom = AtomRef.make({ isOpen: true });
export function toggleRightSidebar() {
  rightSidebarAtom.update(({ isOpen }) => ({ isOpen: !isOpen }));
}
