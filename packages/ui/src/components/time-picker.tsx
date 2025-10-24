import { useRef } from "react";
import { Input, type InputProps } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./select";

export interface TimePickerProps
  extends Omit<InputProps, "value" | "onChange" | "type"> {
  format: (date: Date) => string;
  value: Date;
  onChange: (value: Date) => void;
  step?: 5 | 10 | 15 | 20 | 30;
}

function TimePicker({
  format,
  step = 15,
  value,
  onChange,
  ...props
}: TimePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const totalSteps = (24 * 60) / step;

  return (
    <Select
      onOpenChange={(open) => {
        if (open) {
          setTimeout(() => {
            inputRef.current?.focus();
          }, 0);
        }
      }}
    >
      <SelectTrigger
        render={({ className: discard, ...triggerProps }) => (
          <div {...triggerProps} />
        )}
        showChevron={false}
      >
        <Input
          {...props}
          onChange={(e) => onChange(new Date(e.target.value))}
          ref={inputRef}
          step={60}
          type="time"
          value={value ? format(value) : ""}
        />
      </SelectTrigger>
      <SelectContent
        align="end"
        className="max-h-[200px] overflow-y-auto"
        side="left"
      >
        {Array.from({ length: totalSteps }, (_, i) => {
          const minutesSinceMidnight = i * step;
          const hours = Math.floor(minutesSinceMidnight / 60);
          const minutes = minutesSinceMidnight % 60;
          const numberDate = new Date().setHours(hours, minutes, 0, 0);
          const date = new Date(numberDate);

          return (
            <SelectItem
              key={numberDate}
              onClick={() => {
                onChange(date);
              }}
              showCheck={false}
            >
              {format(date)}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export { TimePicker };
