import { useAtomRef } from "@effect-atom/atom-react";
import { Button } from "@mason/ui/button";
import { isToday } from "date-fns";
import {
  calendarSelectedDateAtom,
  setCalendarSelectedDate,
} from "~/atoms/calendar-atom";

function TodayButton() {
  const selectedDate = useAtomRef(calendarSelectedDateAtom);

  return (
    <>
      {!isToday(selectedDate) && (
        <Button
          onClick={() => {
            setCalendarSelectedDate(new Date());
          }}
          variant="ghost"
        >
          Today
        </Button>
      )}
    </>
  );
}

export { TodayButton };
