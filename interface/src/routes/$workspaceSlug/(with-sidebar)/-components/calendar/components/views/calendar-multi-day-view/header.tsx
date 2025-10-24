import { useAtomRef } from "@effect-atom/atom-react";
import { cn } from "@mason/ui/utils";
import { isSameDay } from "date-fns";
import { calendarCurrentTimeAtom } from "~/atoms/calendar-atom";
import { formatter } from "~/utils/date-time";
import {
  CALENDAR_DAY_HEADER_HEIGHT_VAR,
  CALENDAR_HOUR_COLUMN_WIDTH_VAR,
} from "../../..";

function Header({ weekdays }: { weekdays: Array<Date> }) {
  const currentTime = useAtomRef(calendarCurrentTimeAtom);

  return (
    <div
      className="flex items-center justify-center border-b"
      style={{
        height: `var(${CALENDAR_DAY_HEADER_HEIGHT_VAR})`,
        paddingLeft: `var(${CALENDAR_HOUR_COLUMN_WIDTH_VAR})`,
      }}
    >
      <div
        className="grid flex-1"
        style={{
          gridTemplateColumns: `repeat(${weekdays.length}, 1fr)`,
        }}
      >
        {weekdays.map((day) => {
          const isCurrentDay = isSameDay(day, currentTime);
          return (
            <div
              className={cn(
                "flex items-center justify-center gap-1",
                isCurrentDay ? "text-foreground" : "text-muted-foreground"
              )}
              key={day.toString()}
            >
              <span>{formatter.weekdayShort(day)}</span>
              <span
                className={cn(
                  "rounded-md px-1",
                  isCurrentDay && "bg-primary text-primary-foreground"
                )}
              >
                {formatter.day(day)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { Header };
