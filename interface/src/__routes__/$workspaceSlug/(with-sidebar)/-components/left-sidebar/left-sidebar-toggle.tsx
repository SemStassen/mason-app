import { useAtomRef } from "@effect-atom/atom-react";
import { Button } from "@mason/ui/button";
import { Icons } from "@mason/ui/icons";
import { leftSidebarAtom, toggleLeftSidebar } from "~/atoms/ui-atoms";
import { useRegisterCommands } from "~/components/app-commands-dialog";

function LeftSidebarToggle() {
  const { isOpen } = useAtomRef(leftSidebarAtom);

  useRegisterCommands(() => [
    {
      title: isOpen ? "Close left sidebar" : "Open left sidebar",
      value: isOpen ? "close-left-sidebar" : "open-left-sidebar",
      hotkey: "bracketleft",
      category: "navigation",
      onSelect: (dialog) => {
        toggleLeftSidebar();
        dialog.close();
      },
    },
  ]);

  return (
    <Button onClick={toggleLeftSidebar} size="icon" variant="ghost">
      <Icons.Sidebar />
    </Button>
  );
}

export { LeftSidebarToggle };
