import { useDroppable } from '@dnd-kit/react';

type DroppableTimeEntryProps = {
  id: string;
  children: React.ReactNode;
};

function DroppableTimeEntry({ id, children }: DroppableTimeEntryProps) {
  const { ref } = useDroppable({
    id: id,
  });

  return <div ref={ref}>{children}</div>;
}

export { DroppableTimeEntry };
