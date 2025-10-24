import { AtomRef } from "@effect-atom/atom";
import { addDays, isEqual, subDays } from "date-fns";

type ICalendarAtom = {
  view: "days";
  daysInView: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  selectedDate: Date;
  currentTime: Date;
  dragSelection: {
    firstSelected: Date;
    secondSelected: Date;
  } | null;
  isDragSelectionActive: boolean;
};

const calendarAtom = AtomRef.make<ICalendarAtom>({
  view: "days",
  daysInView: 7,
  selectedDate: new Date(),
  currentTime: new Date(),
  dragSelection: null,
  isDragSelectionActive: false,
});

export const calendarViewAtom = calendarAtom.prop("view");
export const calendarDaysInViewAtom = calendarAtom.prop("daysInView");
export const calendarSelectedDateAtom = calendarAtom.prop("selectedDate");
export const calendarCurrentTimeAtom = calendarAtom.prop("currentTime");
export const calendarDragSelectionAtom = calendarAtom.prop("dragSelection");
export const calendarSortedDragSelectionAtom = calendarDragSelectionAtom.map(
  (dragSelection) => {
    if (!dragSelection) {
      return null;
    }

    return dragSelection.firstSelected < dragSelection.secondSelected
      ? {
          start: dragSelection.firstSelected,
          end: dragSelection.secondSelected,
        }
      : {
          start: dragSelection.secondSelected,
          end: dragSelection.firstSelected,
        };
  }
);
export const calendarIsDragSelectionActiveAtom = calendarAtom.prop(
  "isDragSelectionActive"
);

export function setCalendarView(view: ICalendarAtom["view"]) {
  calendarAtom.update((value) => ({
    ...value,
    view: view,
  }));
}
export function setCalendarDaysInView(daysInView: ICalendarAtom["daysInView"]) {
  calendarAtom.update((value) => ({
    ...value,
    daysInView: daysInView,
  }));
}
export function setCalendarSelectedDate(date: ICalendarAtom["selectedDate"]) {
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

export function resetDragSelection() {
  calendarAtom.update((value) => ({
    ...value,
    dragSelection: null,
  }));
}

export function setDragSelectionFirst(firstSelected: Date) {
  calendarAtom.update((value) => ({
    ...value,
    dragSelection: {
      firstSelected: firstSelected,
      secondSelected: firstSelected,
    },
  }));
}

export function setDragSelectionSecond(secondSelected: Date) {
  calendarAtom.update((value) => {
    if (
      !value.dragSelection ||
      isEqual(value.dragSelection.secondSelected, secondSelected)
    ) {
      return value; // no change → no re-render
    }

    return {
      ...value,
      dragSelection: {
        ...value.dragSelection,
        secondSelected: secondSelected,
      },
    };
  });
}

export function setIsDragSelectionActive(isDragSelectionActive: boolean) {
  calendarAtom.update((value) => ({
    ...value,
    isDragSelectionActive: isDragSelectionActive,
  }));
}

export function _setCurrentTime(currentTime: Date) {
  calendarAtom.update((value) => ({
    ...value,
    currentTime: currentTime,
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
    _setCurrentTime(new Date());

    // Then update every minute exactly
    setInterval(() => {
      _setCurrentTime(new Date());
    }, 60 * 1000);
  }, millisecondsUntilNextMinute);
})();
