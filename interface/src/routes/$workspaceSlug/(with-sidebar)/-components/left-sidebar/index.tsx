import { useAtomRef } from "@effect-atom/atom-react";
import { Button } from "@mason/ui/button";
import { type IconProps, Icons } from "@mason/ui/icons";
import { Link, linkOptions } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { leftSidebarAtom } from "~/atoms/ui-atoms";
import { LedgerToggle } from "./ledger-toggle";
import { UserDropdownMenu } from "./user-dropdown-menu";
import { WorkspaceDropdownMenu } from "./workspace-dropdown-menu";

const DEFAULT_SIDEBAR_WIDTH = 240;

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
        Icon: (props: IconProps) => <Icons.Folder {...props} />,
      }),
    ],
  },
];

function LeftSidebar() {
  const { isOpen } = useAtomRef(leftSidebarAtom);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);

  const handleResize = (e: React.MouseEvent<HTMLDivElement>) => {
    setSidebarWidth(e.clientX);
  };

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.aside
          animate={{ width: sidebarWidth }}
          className="relative h-full overflow-hidden"
          exit={{ width: 0 }}
          initial={{ width: 0 }}
          transition={{
            ease: "linear",
            duration: 0.1,
          }}
        >
          <nav
            className="flex h-full flex-col justify-between border-r px-4 pt-2 pb-4"
            style={{
              width: sidebarWidth,
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
          </nav>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: Okay for resize */}
          <div
            className="absolute inset-y-0 right-0 w-[7px] cursor-col-resize"
            onMouseDown={handleResize}
            role="presentation"
          />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export { LeftSidebar };
