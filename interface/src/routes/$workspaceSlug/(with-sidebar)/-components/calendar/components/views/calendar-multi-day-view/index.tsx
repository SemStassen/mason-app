import { useAtomRef } from "@effect-atom/atom-react";
import { ScrollArea } from "@mason/ui/scroll-area";
import {
  addDays,
  areIntervalsOverlapping,
  isSameDay,
  setHours,
  setMinutes,
} from "date-fns";
import {
  calendarDaysInViewAtom,
  calendarDragSelectionAtom,
  calendarSelectedDateAtom,
  resetDragSelection,
  setDragSelectionFirst,
  setDragSelectionSecond,
  setIsDragSelectionActive,
} from "~/atoms/calendar-atom";
import { formatter } from "~/utils/date-time";
import {
  CALENDAR_DAY_HEADER_HEIGHT_VAR,
  CALENDAR_HEADER_HEIGHT_VAR,
  CALENDAR_HOUR_COLUMN_WIDTH_VAR,
  CALENDAR_HOUR_HEIGHT_VAR,
} from "../../..";
import { DUMMY_TIME_ENTRIES } from "../../../dummy-time-entries";
import { getTimeEntryBlockStyle, groupTimeEntries } from "../../../helpers";
import { DroppableTimeEntry } from "../../dnd/droppable-time-entry";
import { CurrentTimeLine } from "../../views/current-time-line";
import { DragSelectionHighlight } from "../../views/drag-selection-highlight";
import { TimeEntry } from "../../views/time-entry";
import { Header } from "./header";

const hours = Array.from({ length: 24 }).map((_, hourIndex) => hourIndex);
const timeSlotsPerHour = Array.from({ length: 4 }).map(
  (_, timeSlotIndex) => timeSlotIndex
);

const handlePointerDown = () => {
  resetDragSelection();
  setIsDragSelectionActive(true);

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
};

const handlePointerMove = (e: PointerEvent) => {
  const dataDate = (e.target as HTMLElement).dataset.date;
  if (!dataDate) {
    return;
  }

  if (calendarDragSelectionAtom.value?.firstSelected) {
    setDragSelectionSecond(new Date(dataDate));
  } else {
    setDragSelectionFirst(new Date(dataDate));
  }
};

const handlePointerUp = () => {
  setIsDragSelectionActive(false);

  window.removeEventListener("pointermove", handlePointerMove);
  window.removeEventListener("pointerup", handlePointerUp);
};

function CalendarMultiDayView() {
  const selectedDate = useAtomRef(calendarSelectedDateAtom);
  const daysInView = useAtomRef(calendarDaysInViewAtom);
  const weekdays = Array.from({ length: daysInView }).map((_, dayIndex) =>
    addDays(selectedDate, dayIndex)
  );

  return (
    <div className="flex flex-col">
      {/* Header */}
      <Header weekdays={weekdays} />
      <ScrollArea
        className="[&>div]:overscroll-none"
        orientation="vertical"
        style={{
          height: `calc(100vh - var(${CALENDAR_HEADER_HEIGHT_VAR}) - var(${CALENDAR_DAY_HEADER_HEIGHT_VAR}))`,
        }}
      >
        <div className="flex">
          {/* Hours column */}
          <div
            className="border-r"
            style={{
              width: `var(${CALENDAR_HOUR_COLUMN_WIDTH_VAR})`,
            }}
          >
            {hours.map((hour) => (
              <div
                className="relative"
                key={hour}
                style={{
                  height: `var(${CALENDAR_HOUR_HEIGHT_VAR})`,
                }}
              >
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
              gridTemplateColumns: `repeat(${weekdays.length}, 1fr)`,
            }}
          >
            {weekdays.map((day) => {
              const dayTimeEntries = DUMMY_TIME_ENTRIES.filter(
                (timeEntry) =>
                  isSameDay(timeEntry.startedAt, day) ||
                  isSameDay(timeEntry.stoppedAt, day)
              );
              const groupedTimeEntries = groupTimeEntries(dayTimeEntries);

              return (
                <div className="relative" key={day.toString()}>
                  <DragSelectionHighlight day={day} />
                  {hours.map((hour) => (
                    <div
                      className="border-b"
                      key={hour}
                      style={{
                        height: `var(${CALENDAR_HOUR_HEIGHT_VAR})`,
                      }}
                    >
                      {/* Change this for better creation precision */}
                      {/* 4 = 15 min, 6 = 10 min, 12 = 5 min */}
                      {timeSlotsPerHour.map((timeSlotIndex) => {
                        const minutes =
                          timeSlotIndex * (60 / timeSlotsPerHour.length);

                        const date = setMinutes(setHours(day, hour), minutes);

                        return (
                          <DroppableTimeEntry
                            data-date={date}
                            id={`${day.toString()}-${hour}-${minutes}`}
                            key={timeSlotIndex}
                            onPointerDown={() => handlePointerDown()}
                            style={{
                              height: `calc(var(${CALENDAR_HOUR_HEIGHT_VAR}) / ${timeSlotsPerHour.length})`,
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}
                  {groupedTimeEntries.map((group, groupIndex) =>
                    group.map((timeEntry) => {
                      let style = getTimeEntryBlockStyle(
                        timeEntry,
                        day,
                        groupIndex,
                        groupedTimeEntries.length
                      );
                      const hasOverlap = groupedTimeEntries.some(
                        (otherGroup, otherIndex) =>
                          otherIndex !== groupIndex &&
                          otherGroup.some((otherTimeEntry) =>
                            areIntervalsOverlapping(
                              {
                                start: timeEntry.startedAt,
                                end: timeEntry.stoppedAt,
                              },
                              {
                                start: otherTimeEntry.startedAt,
                                end: otherTimeEntry.stoppedAt,
                              }
                            )
                          )
                      );

                      if (!hasOverlap) {
                        style = { ...style, width: "100%", left: "0%" };
                      }

                      return (
                        <div
                          className="absolute p-0.5"
                          key={timeEntry.id}
                          style={style}
                        >
                          <TimeEntry timeEntry={timeEntry} />
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
            <CurrentTimeLine />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export { CalendarMultiDayView };
