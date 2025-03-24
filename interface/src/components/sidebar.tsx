import { Button } from "@mason/ui/button";
import { Hotkey } from "@mason/ui/hotkey";
import { Icons } from "@mason/ui/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@mason/ui/tooltip";
import { Link, useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { AnimatePresence, motion } from "motion/react";
import { useHotkeys } from "react-hotkeys-hook";
import { HOTKEYS } from "~/lib/constants/hotkeys";
import { rootStore } from "~/stores/root-store";

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
    Icon: () => <Icons.Target size={22} />,
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
            className="flex w-full items-center justify-start gap-2 rounded-md px-2 py-1 text-contrast-50 text-sm hover:bg-contrast-5 hover:text-foreground"
          >
            <item.Icon />
            {item.name}
          </Link>
        </li>
      </TooltipTrigger>
      <TooltipContent side="right">
        Go to {item.name.toLowerCase()} <Hotkey>{item.hotkey}</Hotkey>
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
          className="flex-none overflow-hidden border-r bg-sidebar"
          transition={{
            ease: "linear",
            duration: 0.1,
          }}
          initial={{ width: 0 }}
          animate={{ width: 292 }}
          exit={{ width: 0 }}
        >
          <div className="flex h-full w-[292px] flex-none flex-col justify-between px-4 pt-4 pb-2">
            {/* Logo and navigation */}
            <div className="flex h-full w-full flex-col space-y-6">
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
            <div className="flex items-center justify-between">
              <small className="text-contrast-50 text-xs">
                Mason - Alpha v0.1
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
  const { uiStore } = rootStore;
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
      <TooltipContent className="flex items-center gap-1" align="start">
        {uiStore.isSidebarOpen ? "close sidebar" : "open sidebar"}
        <Hotkey>{hotkey}</Hotkey>
      </TooltipContent>
    </Tooltip>
  );
});

export { Sidebar, SidebarToggle };
