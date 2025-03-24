import { DayPicker } from "react-day-picker";

import { cn } from "../utils";
import { Button, buttonVariants } from "./button";
import { Icons } from "./icons";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  showWeekNumber = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      showWeekNumber={showWeekNumber}
      className={cn("p-3", className)}
      classNames={{
        months: "relative flex flex-col",
        nav: "absolute top-0 right-0 flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        month: "space-y-4",
        month_caption: "flex items-center justify-start pt-1",
        caption_label: "text-sm",
        weekdays: "flex",
        weekday: "w-8 font-normal text-contrast-30 text-xs",
        week: "mt-px flex w-full",
        week_number_header: "w-8",
        week_number:
          "inline-flex w-8 items-center justify-center font-normal text-contrast-30 text-xs",
        day: cn(
          // props.mode === "range"
          //   ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
          //   : "[&:has([aria-selected])]:rounded-md",
        ),
        range_start: "day-range-start",
        range_end: "day-range-end",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        ...classNames,
      }}
      components={{
        PreviousMonthButton: ({ className, ...props }) => {
          return (
            <Button variant="ghost" size="icon" {...props}>
              <Icons.ChevronUp className="h-4 w-4" />
            </Button>
          );
        },
        NextMonthButton: ({ className, ...props }) => {
          return (
            <Button variant="ghost" size="icon" {...props}>
              <Icons.ChevronDown className="h-4 w-4" />
            </Button>
          );
        },
        DayButton: ({ className, children, modifiers, day, ...props }) => {
          return (
            <button
              className={cn(
                "group inline-flex h-full w-full items-center justify-center",
                className,
              )}
              {...props}
            >
              <span
                className={cn(
                  modifiers.today &&
                    "h-5 w-6 rounded-sm bg-primary text-white group-hover:bg-primary/80",
                )}
              >
                {children}
              </span>
            </button>
          );
        },
        Day: ({ className, modifiers, day, ...props }) => {
          return (
            <td
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "w-8 cursor-pointer px-0 text-contrast-75 text-sm",
                modifiers.selected &&
                  "bg-contrast-10 text-foreground hover:bg-contrast-20",
                modifiers.outside &&
                  "text-contrast-30 aria-selected:bg-contrast-10 aria-selected:text-contrast-75",
                modifiers.invisible && "invisible",
                modifiers.disabled && "text-contrast-50",
                className,
              )}
              {...props}
            />
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
