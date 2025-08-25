import { useAtomSet, useAtomValue } from '@effect-atom/atom-react';
import { Button } from '@mason/ui/button';
import { isToday } from 'date-fns';
import { calendarAtom } from '~/atoms/calendar-atoms';

function TodayButton() {
  const { selectedDate } = useAtomValue(calendarAtom);
  const setCalendar = useAtomSet(calendarAtom);

  return (
    <>
      {!isToday(selectedDate) && (
        <Button
          onClick={() => {
            setCalendar((value) => ({ ...value, selectedDate: new Date() }));
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
