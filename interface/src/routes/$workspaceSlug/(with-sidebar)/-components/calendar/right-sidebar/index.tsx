import { useAtomRef } from "@effect-atom/atom-react";
import { AnimatePresence, motion } from "motion/react";
import {
  calendarIsDragSelectionActiveAtom,
  calendarSortedDragSelectionAtom,
} from "~/atoms/calendar-atom";
import { useConditionalMemo } from "~/hooks/use-conditional-memo";
import { CreateTimeEntryForm } from "./create-time-entry-form";

const SIDEBAR_WIDTH = 300;

function RightSidebar() {
  // To prevent re-renders only isDragSelectionActive is reactive
  const isDragSelectionActive = useAtomRef(calendarIsDragSelectionActiveAtom);

  const isOpen = useConditionalMemo(
    () =>
      Boolean(calendarSortedDragSelectionAtom.value && !isDragSelectionActive),
    isDragSelectionActive
  );

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.aside
          animate={{ width: SIDEBAR_WIDTH }}
          className="h-full overflow-hidden border-l"
          exit={{ width: 0 }}
          initial={{ width: 0 }}
          transition={{
            ease: "linear",
            duration: 0.1,
          }}
        >
          <div
            className="mt-8 flex h-full flex-col justify-between px-4 pt-3 pb-4"
            style={{
              width: SIDEBAR_WIDTH,
            }}
          >
            <CreateTimeEntryForm />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export { RightSidebar };
