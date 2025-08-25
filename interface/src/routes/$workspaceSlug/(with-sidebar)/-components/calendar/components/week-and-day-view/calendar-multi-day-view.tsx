import { useAtomValue } from '@effect-atom/atom-react';
import { ScrollArea } from '@mason/ui/scroll-area';
import { cn } from '@mason/ui/utils';
import { addDays, isToday } from 'date-fns';
import { calendarAtom } from '~/atoms/calendar-atoms';
import { formatter } from '~/utils/date-time';

const hours = Array.from({ length: 24 }).map((_, hourIndex) => hourIndex);

function CalendarMultiDayView() {
  const { selectedDate, daysInView } = useAtomValue(calendarAtom);
  const weekDays = Array.from({ length: daysInView }).map((_, dayIndex) =>
    addDays(selectedDate, dayIndex)
  );

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-center border-b"
        style={{
          height: 'var(--calendar-day-header-height)',
          paddingLeft: 'var(--calendar-hour-column-width)',
        }}
      >
        <div
          className="grid flex-1"
          style={{
            gridTemplateColumns: `repeat(${weekDays.length}, 1fr)`,
          }}
        >
          {weekDays.map((day) => (
            <div
              className={cn(
                'flex items-center justify-center gap-1',
                isToday(day) ? 'text-foreground' : 'text-muted-foreground'
              )}
              key={day.toString()}
            >
              <span>{formatter.weekdayShort(day)}</span>
              <span
                className={cn(
                  'rounded-md px-1',
                  isToday(day) && 'bg-primary text-primary-foreground'
                )}
              >
                {formatter.day(day)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <ScrollArea
        className="[&>div]:overscroll-none"
        orientation="vertical"
        style={{
          height:
            'calc(100vh - var(--calendar-header-height) - var(--calendar-day-header-height))',
        }}
      >
        <div className="flex">
          {/* Hours column */}
          <div
            className="border-r"
            style={{
              width: 'var(--calendar-hour-column-width)',
            }}
          >
            {hours.map((hour) => (
              <div className="relative h-24" key={hour}>
                {hour !== 0 && (
                  <span className="-translate-y-1/2 -translate-x-1/2 absolute left-1/2">
                    {formatter.time(new Date(0, 0, 0, hour))}
                  </span>
                )}
              </div>
            ))}
          </div>
          {/* Day column */}
          <div
            className="relative grid w-full"
            style={{
              gridTemplateColumns: `repeat(${weekDays.length}, 1fr)`,
            }}
          >
            {weekDays.map((day) => (
              <div key={day.toString()}>
                {hours.map((hour) => (
                  <div className="h-24 border-b" key={hour} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export { CalendarMultiDayView };
