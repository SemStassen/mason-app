import { useAtomRef } from "@effect-atom/atom-react";
import { Button } from "@mason/ui/button";
import { type IconProps, Icons } from "@mason/ui/icons";
import { Link, linkOptions } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { leftSidebarAtom } from "~/atoms/ui-atoms";

import { LedgerToggle } from "./ledger-toggle";
import { UserDropdownMenu } from "./user-dropdown-menu";
import { WorkspaceDropdownMenu } from "./workspace-dropdown-menu";

const SIDEBAR_WIDTH = 240;

const NAV_ITEMS = [
  {
    groupLabel: "Dashboards",
    items: [
      linkOptions({
        to: "/$workspaceSlug",
        from: "/$workspaceSlug",
        label: "Log time",
        Icon: (props: IconProps) => <Icons.Home {...props} />,
      }),
      linkOptions({
        to: "/$workspaceSlug/projects",
        from: "/$workspaceSlug",
        label: "Projects",
        Icon: (props: IconProps) => <Icons.Home {...props} />,
      }),
    ],
  },
];

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
            <div className="space-y-4">
              <div className="ml-10">
                <WorkspaceDropdownMenu />
              </div>
              {NAV_ITEMS.map(({ groupLabel, items }) => (
                <div key={groupLabel}>
                  <div className="mb-2 font-medium text-xs">{groupLabel}</div>
                  <ul className="space-y-0.5">
                    {items.map(({ label, Icon, to, from }) => (
                      <li key={to}>
                        <Button
                          key={to}
                          render={
                            <Link
                              className="w-full justify-start gap-2"
                              from={from}
                              to={to}
                            >
                              <Icon size={16} />
                              {label}
                            </Link>
                          }
                          size="sm"
                          variant="ghost"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
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
              {/* Wrap in a div to avoid layout shift when the dropdown menu is open */}
              <div>
                <UserDropdownMenu />
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export { LeftSidebar };
