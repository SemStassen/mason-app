import {
  format,
  formatDuration,
  getHours,
  getMinutes,
  intervalToDuration,
} from "date-fns";
import { rootStore } from "~/stores/root-store";

const formatters = {
  time: (date: Date) => {
    const timeFormat = rootStore.uiStore.uses24HourClock
      ? getMinutes(date) === 0
        ? "ha"
        : "h:mma"
      : "HH:mm";

    return format(date, timeFormat);
  },
  duration: (startDate: Date, endDate: Date) => {
    const baseFormat = formatDuration(
      intervalToDuration({ start: startDate, end: endDate }),
      {
        format: ["hours", "minutes"],
        zero: true,
      },
    );

    return baseFormat.replace(" hours", "h").replace(" minutes", "m");
  },
  month: {
    short: (date: Date) => format(date, "MMM"),
    long: (date: Date) => format(date, "MMMM"),
  },
};

function getDayProgressPercentage(date: Date) {
  const totalDayMinutes = 24 * 60;
  const elapsedMinutes = getMinutes(date) + getHours(date) * 60;

  return (elapsedMinutes / totalDayMinutes) * 100;
}

export { formatters, getDayProgressPercentage };
