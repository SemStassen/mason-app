import { useAtomRef } from "@effect-atom/atom-react";
import { endOfDay, isWithinInterval, startOfDay } from "date-fns";
import { calendarSortedDragSelectionAtom } from "~/atoms/calendar-atom";
import { getDragSelectionStyle } from "../../helpers";

function DragSelectionHighlight({ day }: { day: Date }) {
  const dragSelection = useAtomRef(calendarSortedDragSelectionAtom);

  if (!dragSelection) {
    return null;
  }

  const isDragSelectionOverDay = isWithinInterval(day, {
    start: startOfDay(dragSelection.start),
    end: endOfDay(dragSelection.end),
  });

  if (!isDragSelectionOverDay) {
    return null;
  }

  const style = getDragSelectionStyle(
    {
      start: dragSelection.start,
      end: dragSelection.end,
    },
    day
  );

  return (
    <div
      className="pointer-events-none absolute w-full bg-primary/10"
      style={style}
    />
  );
}

export { DragSelectionHighlight };
