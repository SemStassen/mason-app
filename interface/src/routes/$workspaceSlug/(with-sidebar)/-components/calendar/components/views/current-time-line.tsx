import { useAtomRef } from "@effect-atom/atom-react";
import { calendarCurrentTimeAtom } from "~/atoms/calendar-atom";
import { formatter } from "~/utils/date-time";
import { FIRST_VISIBLE_HOUR, LAST_VISIBLE_HOUR } from "../..";

function CurrentTimeLine() {
  const currentTime = useAtomRef(calendarCurrentTimeAtom);

  const getCurrentTimePosition = () => {
    const minutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    const visibleStartMinutes = FIRST_VISIBLE_HOUR * 60;
    const visibleEndMinutes = LAST_VISIBLE_HOUR * 60;
    const visibleRangeMinutes = visibleEndMinutes - visibleStartMinutes;

    return ((minutes - visibleStartMinutes) / visibleRangeMinutes) * 100;
  };

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-1 border-primary border-t"
      style={{ top: `${getCurrentTimePosition()}%` }}
    >
      <div className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-0 size-3 rounded-full bg-primary" />
      <div className="-left-18 -translate-y-1/2 absolute flex w-16 justify-end bg-background pr-1 font-medium text-primary text-xs">
        {formatter.time(currentTime)}
      </div>
    </div>
  );
}

export { CurrentTimeLine };
