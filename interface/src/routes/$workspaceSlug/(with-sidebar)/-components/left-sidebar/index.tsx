import { useAtomRef } from "@effect-atom/atom-react";
import { Button } from "@mason/ui/button";
import { Icons } from "@mason/ui/icons";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { leftSidebarAtom, toggleDebugSheet } from "~/atoms/ui-atoms";
import { LedgerToggle } from "./ledger-toggle";
import { UserDropdownMenu } from "./user-dropdown-menu";
import { WorkspaceDropdownMenu } from "./workspace-dropdown-menu";

const SIDEBAR_WIDTH = 240;

function LeftSidebar() {
  const { isOpen } = useAtomRef(leftSidebarAtom);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          animate={{ width: SIDEBAR_WIDTH }}
          className="h-full overflow-hidden border-r"
          exit={{ width: 0 }}
          initial={{ width: 0 }}
          transition={{
            ease: "linear",
            duration: 0.1,
          }}
        >
          <div
            className="flex h-full flex-col justify-between px-4 pt-2 pb-4"
            style={{
              width: SIDEBAR_WIDTH,
            }}
          >
            <div className="ml-10">
              <WorkspaceDropdownMenu />
            </div>
            <div className="space-y-2">
              <Button
                className="w-full justify-start"
                render={(props) => (
                  <Link
                    from="/$workspaceSlug"
                    to="/$workspaceSlug/settings"
                    {...props}
                  >
                    <Icons.Settings /> Settings
                  </Link>
                )}
                variant="ghost"
              />
              <LedgerToggle />
              <Button
                className="w-full justify-start"
                onClick={toggleDebugSheet}
                variant="ghost"
              >
                <Icons.Bug />
                Inspector
              </Button>
              <UserDropdownMenu />
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export { LeftSidebar };
