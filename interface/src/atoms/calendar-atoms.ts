import { Atom } from '@effect-atom/atom-react';

export const calendarAtom = Atom.make<{
  view: 'days';
  daysInView: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  selectedDate: Date;
}>({
  view: 'days',
  daysInView: 7,
  selectedDate: new Date(),
});
