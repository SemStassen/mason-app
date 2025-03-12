import { Button } from "@mason/ui/button";
import { Hotkey } from "@mason/ui/hotkey";
import { Icons } from "@mason/ui/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@mason/ui/tooltip";
import { cn } from "@mason/ui/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { AnimatePresence, motion } from "motion/react";
import { useHotkeys } from "react-hotkeys-hook";
import { HOTKEYS } from "~/lib/constants/hotkeys";
import { uiStore } from "~/stores/ui-store";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    path: "/",
    Icon: () => <Icons.Home size={22} />,
    hotkey: HOTKEYS.navigation.goToDashboard.key,
  },
  {
    name: "Tracker",
    path: "/tracker",
    Icon: () => <Icons.Calendar size={22} />,
    hotkey: HOTKEYS.navigation.goToTracker.key,
  },
  {
    name: "Projects",
    path: "/projects",
    Icon: () => <Icons.Organization size={22} />,
    hotkey: HOTKEYS.navigation.goToProjects.key,
  },
  {
    name: "Settings",
    path: "/settings",
    Icon: () => <Icons.Settings size={22} />,
    hotkey: HOTKEYS.navigation.goToSettings.key,
  },
];

interface NavitemProps {
  item: {
    name: string;
    path: string;
    Icon: () => React.JSX.Element;
    hotkey: string;
  };
}

function NavItem({ item }: NavitemProps) {
  const navigate = useNavigate();
  useHotkeys(item.hotkey, () => navigate({ to: item.path }));

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <li>
          <Link
            to={item.path}
            activeProps={{
              className:
                "bg-primary-900/15 text-primary/75 hover:bg-primary-900/25 hover:text-primary",
            }}
            className="flex items-center py-1 px-2 rounded-md w-full justify-start gap-2 text-contrast-50 text-sm hover:bg-contrast-5 hover:text-foreground"
          >
            <item.Icon />
            {item.name}
          </Link>
        </li>
      </TooltipTrigger>
      <TooltipContent side="right">
        {item.name} <Hotkey>{item.hotkey}</Hotkey>
      </TooltipContent>
    </Tooltip>
  );
}

const Sidebar = observer(() => {
  return (
    <AnimatePresence initial={false}>
      {uiStore.isSidebarOpen && (
        <motion.aside
          className="flex-none overflow-hidden border-r bg-sidebar"
          transition={{
            ease: "linear",
            duration: 0.1,
          }}
          initial={{ width: 0 }}
          animate={{ width: 292 }}
          exit={{ width: 0 }}
        >
          <div className="h-full flex-none w-[292px] flex flex-col justify-between px-4 pt-4 pb-2">
            {/* Logo and navigation */}
            <div className="flex h-full flex-col w-full space-y-6">
              <div className="h-20" />
              <div>
                <nav className="flex flex-col">
                  <ul className="space-y-0.5">
                    {NAV_ITEMS.map((item) => {
                      return <NavItem key={item.path} item={item} />;
                    })}
                  </ul>
                </nav>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <small className="text-xs text-contrast-50">
                Mason - Beta v0.1
              </small>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => uiStore.toggleInspector()}
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
  const hotkey = HOTKEYS.navigation.toggleSidebar.key;

  useHotkeys(hotkey, () => uiStore.toggleSidebar());

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => uiStore.toggleSidebar()}
        >
          <Icons.Sidebar />
        </Button>
      </TooltipTrigger>
      <TooltipContent
        className="flex items-center gap-1"
        collisionPadding={{ left: 8 }}
      >
        {uiStore.isSidebarOpen ? "close sidebar" : "open sidebar"}
        <Hotkey>{hotkey}</Hotkey>
      </TooltipContent>
    </Tooltip>
  );
});

export { Sidebar, SidebarToggle };
