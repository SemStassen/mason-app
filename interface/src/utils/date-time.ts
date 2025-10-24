import { format } from "date-fns";
import { enUS, nl } from "date-fns/locale";

const locales = {
  en: enUS,
  nl: nl,
} as const;

type Locale = keyof typeof locales;

const TIME_FORMATS = {
  HOURS_12: "12h",
  HOURS_24: "24h",
} as const;

type TimeFormat = (typeof TIME_FORMATS)[keyof typeof TIME_FORMATS];

type DateTimeConfig = {
  locale: Locale;
  timeFormat: TimeFormat;
};

const defaultConfig: DateTimeConfig = {
  locale: "en",
  timeFormat: "24h",
};

export const formatter = {
  // Time formatting
  time: (date: Date): string => {
    // TODO: make dynamic
    // const currentConfig = { ...getCurrentConfig(), ...config };
    const currentConfig = defaultConfig;

    const timeFormat = {
      "12h": "h:mm a",
      "24h": "HH:mm",
    }[currentConfig.timeFormat];

    return format(date, timeFormat, { locale: locales[currentConfig.locale] });
  },
  // Composed
  date: (date: Date): string => format(date, "MMM d"),
  // TODO: make dynamic
  dateTime: (date: Date): string => format(date, "MMM d, HH:mm"),
  monthYear: (date: Date): string => format(date, "MMM yyyy"),

  // Individual
  day: (date: Date): string => format(date, "d"),
  weekday: (date: Date): string => format(date, "EEEE"),
  weekdayShort: (date: Date): string => format(date, "EEE"),
};
