import { useAtomRef } from "@effect-atom/atom-react";
import { calendarViewAtom } from "~/atoms/calendar-atom";
import { CalendarHeader } from "./components/calendar-header";
import { DndProvider } from "./components/dnd/dnd-provider";
import { CalendarMultiDayView } from "./components/views/calendar-multi-day-view";
import { RightSidebar } from "./right-sidebar";
import { RightSidebarToggle } from "./right-sidebar/right-sidebar-toggle";

export const CALENDAR_HEADER_HEIGHT_VAR = "--calendar-header-height";
export const CALENDAR_DAY_HEADER_HEIGHT_VAR = "--calendar-day-header-height";
export const CALENDAR_HOUR_COLUMN_WIDTH_VAR = "--calendar-hour-column-width";
export const CALENDAR_HOUR_HEIGHT_VAR = "--calendar-hour-height";

export const FIRST_VISIBLE_HOUR = 0;
export const LAST_VISIBLE_HOUR = 24;

function Calendar() {
  const view = useAtomRef(calendarViewAtom);

  return (
    <div className="flex flex-1">
      <div
        className="w-full overflow-hidden"
        style={
          {
            [CALENDAR_HEADER_HEIGHT_VAR]: "48px",
            [CALENDAR_DAY_HEADER_HEIGHT_VAR]: "40px",
            [CALENDAR_HOUR_COLUMN_WIDTH_VAR]: "72px",
            [CALENDAR_HOUR_HEIGHT_VAR]: "64px",
          } as React.CSSProperties
        }
      >
        <CalendarHeader />
        <DndProvider>{view === "days" && <CalendarMultiDayView />}</DndProvider>
      </div>
      <div className="relative">
        <div className="absolute top-1.5 right-1.5">
          <RightSidebarToggle />
        </div>
        <RightSidebar />
      </div>
    </div>
  );
}

export { Calendar };
