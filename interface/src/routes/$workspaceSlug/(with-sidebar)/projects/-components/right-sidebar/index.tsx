import { Button } from "@mason/ui/button";
import { Icons } from "@mason/ui/icons";
import { AnimatePresence, motion } from "motion/react";
import type { Project, Task } from "~/types";

const SIDEBAR_WIDTH = 450;

function RightSidebar({
  selectedProject,
  onClose,
}: {
  selectedProject: (Project & { tasks: Array<Task> }) | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence initial={false}>
      {selectedProject && (
        <motion.aside
          animate={{ width: SIDEBAR_WIDTH }}
          className="h-full border-l"
          exit={{ width: 0 }}
          initial={{ width: 0 }}
          transition={{
            ease: "linear",
            duration: 0.1,
          }}
        >
          <div
            className="flex h-full flex-col px-4 pt-3 pb-4"
            style={{
              width: SIDEBAR_WIDTH,
            }}
          >
            <div className="flex items-center gap-2">
              <Button onClick={onClose} size="icon" variant="ghost">
                <Icons.X size={16} />
              </Button>
              <h4 className="line-clamp-3 whitespace-normal font-semibold text-lg">
                {selectedProject.name}
              </h4>
            </div>
            <div>
              <ul>
                {selectedProject.tasks.map((task) => (
                  <li key={task.id}>{task.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export { RightSidebar };
