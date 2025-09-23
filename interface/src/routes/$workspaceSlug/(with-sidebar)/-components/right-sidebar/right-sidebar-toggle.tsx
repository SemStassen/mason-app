import { useAtomRef } from "@effect-atom/atom-react";
import { Button } from "@mason/ui/button";
import { Icons } from "@mason/ui/icons";
import { rightSidebarAtom, toggleRightSidebar } from "~/atoms/ui-atoms";
import { useRegisterCommands } from "~/components/app-commands-dialog";

function RightSidebarToggle() {
  const { isOpen } = useAtomRef(rightSidebarAtom);

  useRegisterCommands(() => [
    {
      title: isOpen ? "Close right sidebar" : "Open right sidebar",
      value: isOpen ? "close-right-sidebar" : "open-right-sidebar",
      hotkey: "bracketright",
      category: "navigation",
      onSelect: (dialog) => {
        toggleRightSidebar();
        dialog.close();
      },
    },
  ]);

  return (
    <Button onClick={toggleRightSidebar} size="icon" variant="ghost">
      <Icons.Sidebar />
    </Button>
  );
}

export { RightSidebarToggle };
