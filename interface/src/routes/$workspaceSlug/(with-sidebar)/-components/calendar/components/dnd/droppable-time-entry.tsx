import { useDroppable } from "@dnd-kit/react";
import { cn } from "@mason/ui/utils";

type DroppableTimeEntryProps = React.ComponentProps<"div"> & {
  id: string;
};

function DroppableTimeEntry({
  id,
  className,
  ...props
}: DroppableTimeEntryProps) {
  const { ref } = useDroppable({
    id: id,
  });

  return <div className={cn("h-full", className)} ref={ref} {...props} />;
}

export { DroppableTimeEntry };
