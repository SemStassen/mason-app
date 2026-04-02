import { useAtom } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";

import { isLeftSidebarOpenAtom } from "~/atoms/ui-atoms";
import { useRegisterCommands } from "~/components/app-commands-dialog";

function LeftSidebarToggle() {
  const [isOpen, setIsOpen] = useAtom(isLeftSidebarOpenAtom);
  const toggleIsOpen = () => setIsOpen((o) => !o);

  useRegisterCommands(() => [
    {
      title: isOpen ? "Close left sidebar" : "Open left sidebar",
      value: isOpen ? "close-left-sidebar" : "open-left-sidebar",
      hotkey: "bracketleft",
      category: "navigation",
      onSelect: (dialog) => {
        toggleIsOpen();
        dialog.close();
      },
    },
  ]);

  return (
    <Button onClick={toggleIsOpen} size="icon" variant="ghost">
      <Icons.Sidebar />
    </Button>
  );
}

export { LeftSidebarToggle };
