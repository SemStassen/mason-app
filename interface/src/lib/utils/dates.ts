import { format, getHours, getMinutes } from "date-fns";
import { uiStore } from "~/stores/ui-store";

const formatters = {
  time: (date: Date) => {
    const timeFormat = uiStore.uses24HourClock
      ? getMinutes(date) === 0
        ? "ha"
        : "h:mma"
      : "HH:mm";

    return format(date, timeFormat);
  },
};

function getDayProgressPercentage(date: Date) {
  const totalDayMinutes = 24 * 60;
  const elapsedMinutes = getMinutes(date) + getHours(date) * 60;

  return (elapsedMinutes / totalDayMinutes) * 100;
}

export { formatters, getDayProgressPercentage };
