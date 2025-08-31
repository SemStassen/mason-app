import { AtomRef } from '@effect-atom/atom';
import { addDays, subDays } from 'date-fns';

type ICalendarAtom = {
  view: 'days';
  daysInView: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  selectedDate: Date;
  currentTime: Date;
};

const calendarAtom = AtomRef.make<ICalendarAtom>({
  view: 'days',
  daysInView: 7,
  selectedDate: new Date(),
  currentTime: new Date(),
});

export const calendarViewAtom = calendarAtom.prop('view');
export const calendarDaysInViewAtom = calendarAtom.prop('daysInView');
export const calendarSelectedDateAtom = calendarAtom.prop('selectedDate');
export const calendarCurrentTimeAtom = calendarAtom.prop('currentTime');

export function setCalendarView(view: ICalendarAtom['view']) {
  calendarAtom.update((value) => ({
    ...value,
    view: view,
  }));
}
export function setCalendarDaysInView(daysInView: ICalendarAtom['daysInView']) {
  calendarAtom.update((value) => ({
    ...value,
    daysInView: daysInView,
  }));
}
export function setCalendarSelectedDate(date: ICalendarAtom['selectedDate']) {
  calendarAtom.update((value) => ({
    ...value,
    selectedDate: date,
  }));
}
export function goToNextPeriod() {
  calendarAtom.update((value) => ({
    ...value,
    selectedDate: addDays(value.selectedDate, value.daysInView),
  }));
}

export function goToPreviousPeriod() {
  calendarAtom.update((value) => ({
    ...value,
    selectedDate: subDays(value.selectedDate, value.daysInView),
  }));
}

// IIFE to update the currentTime atom
(() => {
  const now = new Date();
  const secondsUntilNextMinute = 60 - now.getSeconds();
  const millisecondsUntilNextMinute =
    secondsUntilNextMinute * 1000 - now.getMilliseconds();

  // Initial timeout to sync with the next minute
  setTimeout(() => {
    calendarAtom.update((value) => ({ ...value, currentTime: new Date() }));

    // Then update every minute exactly
    setInterval(() => {
      calendarAtom.update((value) => ({ ...value, currentTime: new Date() }));
    }, 60 * 1000);
  }, millisecondsUntilNextMinute);
})();
