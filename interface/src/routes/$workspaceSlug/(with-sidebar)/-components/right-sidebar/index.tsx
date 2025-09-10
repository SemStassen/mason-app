import { useAtomRef } from '@effect-atom/atom-react';
import { AnimatePresence, motion } from 'motion/react';
import { rightSidebarAtom } from '~/atoms/ui-atoms';

const SIDEBAR_WIDTH = 240;

function RightSidebar() {
  const { isOpen } = useAtomRef(rightSidebarAtom);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          animate={{ width: SIDEBAR_WIDTH }}
          className="h-full overflow-hidden border-l"
          exit={{ width: 0 }}
          initial={{ width: 0 }}
          transition={{
            ease: 'linear',
            duration: 0.1,
          }}
        >
          <div
            className="flex h-full flex-col justify-between px-4 pt-3 pb-4"
            style={{
              width: SIDEBAR_WIDTH,
            }}
          >
            Info panel
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export { RightSidebar };
