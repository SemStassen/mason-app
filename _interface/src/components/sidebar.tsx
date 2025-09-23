import { Button } from "@mason/ui/button";
import { Hotkey } from "@mason/ui/hotkey";
import { Icons } from "@mason/ui/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@mason/ui/tooltip";
import { Link, linkOptions, useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { HOTKEYS } from "~/lib/constants/hotkeys";
import { rootStore } from "~/stores/root-store";

interface NavItemProps {
  to: string;
  label: string;
  Icon: () => React.ReactElement;
  hotkey: string;
  exact: boolean;
}
const NAV_ITEMS = linkOptions<Array<NavItemProps>>([
  {
    to: "/$workspaceSlug",
    label: "Dashboard",
    Icon: () => <Icons.Home size={22} />,
    hotkey: HOTKEYS.navigation.goToDashboard.key,
    exact: true,
  },
  {
    to: "/$workspaceSlug/tracker",
    label: "Tracker",
    Icon: () => <Icons.Calendar size={22} />,
    hotkey: HOTKEYS.navigation.goToTracker.key,
    exact: false,
  },
  {
    to: "/$workspaceSlug/projects",
    label: "Projects",
    Icon: () => <Icons.Target size={22} />,
    hotkey: HOTKEYS.navigation.goToProjects.key,
    exact: false,
  },
  {
    to: "/$workspaceSlug/settings",
    label: "Settings",
    Icon: () => <Icons.Settings size={22} />,
    hotkey: HOTKEYS.navigation.goToSettings.key,
    exact: false,
  },
]);

function NavItem({ item }: { item: NavItemProps }) {
  const navigate = useNavigate();
  useHotkeys(item.hotkey, () => navigate({ to: item.to }));

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <li>
          <Link
            activeOptions={{
              exact: item.exact,
            }}
            activeProps={{
              className:
                "bg-primary-900/15 text-primary/75 hover:bg-primary-900/25 hover:text-primary",
            }}
            className="flex w-full items-center justify-start gap-2 rounded-md px-2 py-1 text-contrast-50 text-sm hover:bg-contrast-5 hover:text-foreground"
            to={item.to}
          >
            <item.Icon />
            {item.label}
          </Link>
        </li>
      </TooltipTrigger>
      <TooltipContent side="right">
        Go to {item.label.toLowerCase()} <Hotkey>{item.hotkey}</Hotkey>
      </TooltipContent>
    </Tooltip>
  );
}

const Sidebar = observer(() => {
  const { uiStore } = rootStore;

  return (
    <AnimatePresence initial={false}>
      {uiStore.isSidebarOpen && (
        <motion.aside
          animate={{ width: 292 }}
          className="flex-none overflow-hidden border-r bg-sidebar"
          exit={{ width: 0 }}
          initial={{ width: 0 }}
          transition={{
            ease: "linear",
            duration: 0.1,
          }}
        >
          <div className="flex h-full w-[292px] flex-none flex-col justify-between px-4 pt-4 pb-2">
            {/* Logo and navigation */}
            <div className="flex h-full w-full flex-col space-y-6">
              <div className="h-20" />
              <div>
                <nav className="flex flex-col">
                  <ul className="space-y-0.5">
                    {NAV_ITEMS.map((item) => {
                      return <NavItem item={item} key={item.to} />;
                    })}
                  </ul>
                </nav>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <small className="text-contrast-50 text-xs">
                Mason - Alpha v0.1
              </small>
              <Button
                onClick={() => uiStore.toggleInspector()}
                size="sm"
                variant="ghost"
              >
                Inspector
              </Button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
});

const SidebarToggle = observer(() => {
  const { uiStore } = rootStore;
  const hotkey = HOTKEYS.navigation.toggleSidebar.key;

  useHotkeys(hotkey, () => uiStore.toggleSidebar());

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={() => uiStore.toggleSidebar()}
          size="icon"
          variant="ghost"
        >
          <Icons.Sidebar />
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start" className="flex items-center gap-1">
        {uiStore.isSidebarOpen ? "close sidebar" : "open sidebar"}
        <Hotkey>{hotkey}</Hotkey>
      </TooltipContent>
    </Tooltip>
  );
});

export { Sidebar, SidebarToggle };
