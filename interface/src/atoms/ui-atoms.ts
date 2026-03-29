export const leftSidebarAtom = AtomRef.make({ isOpen: true });
export function toggleLeftSidebar() {
  leftSidebarAtom.update(({ isOpen }) => ({ isOpen: !isOpen }));
}
