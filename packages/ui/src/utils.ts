// biome-ignore lint/performance/noNamespaceImport: Fine for chrono-node
import * as chrono from "chrono-node";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

export type ChronoLocale =
  | "en"
  | "en-GB"
  | "fr"
  | "ja"
  | "nl"
  | "ru"
  | "uk"
  // Partially supported
  | "de"
  | "pt"
  | "zh"
  | "zh-Hans"
  | "zh-Hant";

export function chronoParse({
  text,
  ref,
  option,
  locale,
}: {
  text: string;
  ref?: chrono.en.ParsingReference | Date;
  option?: chrono.en.ParsingOption;
  locale?: ChronoLocale;
}) {
  switch (locale) {
    case "de":
      return chrono.de.parseDate(text, ref, option);
    case "en":
      return chrono.en.parseDate(text, ref, option);
    case "en-GB":
      return chrono.en.GB.parseDate(text, ref, option);
    case "fr":
      return chrono.fr.parseDate(text, ref, option);
    case "ja":
      return chrono.ja.parseDate(text, ref, option);
    case "nl":
      return chrono.nl.parseDate(text, ref, option);
    case "pt":
      return chrono.pt.parseDate(text, ref, option);
    case "ru":
      return chrono.ru.parseDate(text, ref, option);
    case "uk":
      return chrono.uk.parseDate(text, ref, option);
    case "zh":
      return chrono.zh.parseDate(text, ref, option);
    case "zh-Hans":
      return chrono.zh.hans.parseDate(text, ref, option);
    case "zh-Hant":
      return chrono.zh.hant.parseDate(text, ref, option);
    default:
      return chrono.parseDate(text, ref, option);
  }
}
