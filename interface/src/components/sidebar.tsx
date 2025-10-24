import { AnimatePresence, motion } from "motion/react";
import type React from "react";

const SIDEBAR_WIDTH = 240;
const isOpen = true;

function Sidebar({ children, ...props }: React.ComponentProps<"div">) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.aside
          animate={{ width: SIDEBAR_WIDTH }}
          className="h-full overflow-hidden"
          exit={{ width: 0 }}
          initial={{ width: 0 }}
          transition={{
            ease: "linear",
            duration: 0.1,
          }}
        >
          <div
            className="flex h-full flex-col justify-between border-r px-4 pt-2 pb-4"
            style={{
              width: SIDEBAR_WIDTH,
            }}
            {...props}
          >
            {children}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
