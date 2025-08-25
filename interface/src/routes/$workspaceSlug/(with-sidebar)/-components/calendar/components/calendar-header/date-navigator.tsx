import { useAtomSet, useAtomValue } from '@effect-atom/atom-react';
import { Button } from '@mason/ui/button';
import { Calendar } from '@mason/ui/calendar';
import { Icons } from '@mason/ui/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@mason/ui/popover';
import { addDays, subDays } from 'date-fns';
import { calendarAtom } from '~/atoms/calendar-atoms';
import { formatter } from '~/utils/date-time';

function DateNavigator() {
  const { selectedDate, daysInView } = useAtomValue(calendarAtom);
  const setCalendar = useAtomSet(calendarAtom);

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
        <PopoverContent>
          <Calendar
            mode="single"
            onSelect={(date) =>
              date && setCalendar((value) => ({ ...value, selectedDate: date }))
            }
            selected={selectedDate}
          />
        </PopoverContent>
      </Popover>
      <div>
        <Button
          onClick={() =>
            setCalendar((value) => ({
              ...value,
              selectedDate: subDays(value.selectedDate, daysInView),
            }))
          }
          size="icon"
          variant="ghost"
        >
          <Icons.ChevronLeft />
        </Button>
        <Button
          onClick={() =>
            setCalendar((value) => ({
              ...value,
              selectedDate: addDays(value.selectedDate, daysInView),
            }))
          }
          size="icon"
          variant="ghost"
        >
          <Icons.ChevronRight />
        </Button>
      </div>
    </>
  );
}

export { DateNavigator };
