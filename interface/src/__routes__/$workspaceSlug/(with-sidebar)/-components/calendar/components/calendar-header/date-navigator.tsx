import { useAtomRef } from "@effect-atom/atom-react";
import { Button } from "@recount/ui/button";
import { Calendar } from "@recount/ui/calendar";
import { Icons } from "@recount/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@recount/ui/popover";

import {
  calendarSelectedDateAtom,
  goToNextPeriod,
  goToPreviousPeriod,
  setCalendarSelectedDate,
} from "~/atoms/calendar.atoms";
import { formatter } from "~/lib/utils/date-time";

function DateNavigator() {
  const selectedDate = useAtomRef(calendarSelectedDateAtom);
  return (
    <>
      <Popover>
        <PopoverTrigger
          render={(props) => (
            <Button variant="ghost" {...props}>
              {formatter.monthYear(selectedDate)}
            </Button>
          )}
        />
        <PopoverContent className="w-fit p-0">
          <Calendar
            mode="single"
            onSelect={(date) => date && setCalendarSelectedDate(date)}
            selected={selectedDate}
          />
        </PopoverContent>
      </Popover>
      <div>
        <Button onClick={goToPreviousPeriod} size="icon" variant="ghost">
          <Icons.ChevronLeft />
        </Button>
        <Button onClick={goToNextPeriod} size="icon" variant="ghost">
          <Icons.ChevronRight />
        </Button>
      </div>
    </>
  );
}

export { DateNavigator };
