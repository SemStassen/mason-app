import {
  addDays,
  getISOWeek,
  getYear,
  isSameMonth,
  isWithinInterval,
  startOfWeek,
  subDays,
} from "date-fns";
import { makeAutoObservable } from "mobx";
import { formatters } from "~/lib/utils/dates";
import { rootStore } from "./root-store";

interface DateRange {
  start: Date;
  end: Date;
}

class TrackerStore {
  /**
   * This always represent the left most date in the view.
   */
  dateInView = new Date();
  /**
   * This is the number of days that are visible in the view.
   */
  daysInView = 1;
  /**
   * This is the current date that is updated every minute.
   */
  currentDate = new Date();
  private intervalId?: number;

  constructor() {
    makeAutoObservable(this);
    this.startUpdatingCurrentDate();
  }

  get weekStartsOn() {
    return rootStore.appStore.startOfWeekDay;
  }

  get visibleDateRange(): DateRange {
    return {
      start: this.dateInView,
      end: addDays(this.dateInView, this.daysInView - 1),
    };
  }

  get dateInViewWeekNumber() {
    return getISOWeek(this.dateInView);
  }

  get dateInViewMonth() {
    if (isSameMonth(this.visibleDateRange.start, this.visibleDateRange.end)) {
      return [
        this.visibleDateRange.start.toLocaleString("default", {
          month: "short",
        }),
      ];
    }

    return [
      formatters.month.short(this.visibleDateRange.start),
      formatters.month.short(this.visibleDateRange.end),
    ];
  }

  get dateInViewYear() {
    return getYear(this.dateInView);
  }

  goToToday() {
    this.dateInView = this.currentDate;

    if (this.daysInView !== 1) {
      this.snapToStartOfWeek();
    }
  }

  get isTodayInView() {
    const viewStart = this.dateInView;
    const viewEnd = addDays(this.dateInView, this.daysInView - 1);

    return isWithinInterval(this.currentDate, {
      start: viewStart,
      end: viewEnd,
    });
  }

  goToNextPeriod() {
    this.dateInView = addDays(this.dateInView, this.daysInView);
  }

  goToPreviousPeriod() {
    this.dateInView = subDays(this.dateInView, this.daysInView);
  }

  setDateInView(date: Date) {
    this.dateInView = date;

    if (this.daysInView !== 1) {
      this.snapToStartOfWeek();
    }
  }

  setDaysInView(amount: number) {
    this.daysInView = amount;

    if (amount !== 1) {
      this.snapToStartOfWeek();
    }
  }

  private snapToStartOfWeek() {
    this.dateInView = startOfWeek(this.dateInView, {
      weekStartsOn: this.weekStartsOn,
    });
  }

  private startUpdatingCurrentDate() {
    // Calculate delay until start of next minute
    const now = new Date();

    this.currentDate = now;

    const msUntilNextMinute =
      60000 - (now.getSeconds() * 1000 + now.getMilliseconds());

    // Initial timeout to align with start of next minute
    setTimeout(() => {
      this.currentDate = new Date();

      // Then update every minute
      this.intervalId = setInterval(() => {
        this.currentDate = new Date();
      }, 60000);
    }, msUntilNextMinute);
  }

  dispose() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

export { TrackerStore };
