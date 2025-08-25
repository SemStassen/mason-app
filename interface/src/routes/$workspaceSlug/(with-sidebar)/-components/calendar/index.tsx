import { useAtomValue } from '@effect-atom/atom-react';
import { calendarAtom } from '~/atoms/calendar-atoms';
import { CalendarHeader } from './components/calendar-header';
import { CalendarMultiDayView } from './components/week-and-day-view/calendar-multi-day-view';

function Calendar() {
  const { view } = useAtomValue(calendarAtom);

  return (
    <div
      className="overflow-hidden"
      style={
        {
          '--calendar-header-height': '48px',
          '--calendar-day-header-height': '40px',
          '--calendar-hour-column-width': '72px',
        } as React.CSSProperties
      }
    >
      <CalendarHeader />
      {view === 'days' && <CalendarMultiDayView />}
    </div>
  );
}

export { Calendar };
