import { useAtomRef } from "@effect-atom/atom-react";
import { Button } from "@mason/ui/button";
import { Icons } from "@mason/ui/icons";
import { motion } from "motion/react";
import { leftSidebarAtom } from "~/atoms/ui-atoms";
import { CALENDAR_HEADER_HEIGHT_VAR } from "../..";
import { DateNavigator } from "./date-navigator";
import { OptionsDropdown } from "./options-dropdown";
import { TodayButton } from "./today-button";

export function CalendarHeader() {
  const { isOpen: isLeftSidebarOpen } = useAtomRef(leftSidebarAtom);

  return (
    <motion.div
      animate={{
        marginLeft: isLeftSidebarOpen ? 0 : 48,
      }}
      className="mx-2 flex items-center justify-between gap-4"
      initial={false}
      style={{
        height: `var(${CALENDAR_HEADER_HEIGHT_VAR})`,
      }}
      transition={{
        ease: "linear",
        duration: 0.1,
      }}
    >
      <div className="flex gap-2">
        <DateNavigator />
        <TodayButton />
      </div>
      <div className="flex gap-2">
        <OptionsDropdown />
        <Button variant="ghost">
          <Icons.Plus />
          Add entry (NI)
        </Button>
      </div>
    </motion.div>
  );
}
