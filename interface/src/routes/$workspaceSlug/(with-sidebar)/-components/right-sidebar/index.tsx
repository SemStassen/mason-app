import { useAtomRef } from '@effect-atom/atom-react';
import { Button } from '@mason/ui/button';
import { Icons } from '@mason/ui/icons';
import { Link } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'motion/react';
import { rightSidebarAtom } from '~/atoms/ui-atoms';
import { Route } from '../..';

const SIDEBAR_WIDTH = 240;

function RightSidebar() {
  const { isOpen } = useAtomRef(rightSidebarAtom);
  const { workspace } = Route.useRouteContext();

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
            <div className="ml-10">{workspace.name}</div>
            <div className="space-y-2">
              <Button
                className="w-full"
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
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export { RightSidebar };
