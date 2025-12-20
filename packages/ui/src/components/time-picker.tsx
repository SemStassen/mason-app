import { useMemo, useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./combobox.coss";
import { InputTime, type InputTimeProps } from "./input-time";

export interface TimePickerProps extends InputTimeProps {
  step?: 5 | 10 | 15 | 20 | 30;
}

type Item = Date;

const TimePicker = ({
  format,
  step = 15,
  value,
  onChange,
  defaultValue,
  ...props
}: TimePickerProps) => {
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? new Date()
  );

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  function setValue(next: Date) {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
  }

  const totalSteps = (24 * 60) / step;

  const items: Array<Date> = useMemo(
    () =>
      Array.from({ length: totalSteps }, (_, i) => {
        const minutes = i * step;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        const d = new Date(currentValue);
        d.setHours(hours, mins, 0, 0);
        return d;
      }),
    [totalSteps, step, currentValue]
  );

  function handleValueChange(selected: unknown) {
    if (typeof selected === "string") {
      const parsed = new Date(selected);
      if (!Number.isNaN(parsed.getTime())) {
        setValue(parsed);
      }
    }
  }

  return (
    <Combobox
      // Disable filtering
      filter={() => true}
      items={items}
      onValueChange={handleValueChange}
      value={currentValue.toISOString()}
    >
      <ComboboxInput
        render={(inputProps) => {
          const {
            // @ts-expect-error: Value does exist
            value: _value,
            defaultValue: _defaultValue,
            ...safeInputProps
          } = inputProps;
          return (
            <InputTime
              {...safeInputProps}
              format={format}
              onBlur={props.onBlur}
              onChange={setValue}
              value={currentValue}
            />
          );
        }}
      />
      <ComboboxContent>
        <ComboboxList>
          {(item: Item) => (
            <ComboboxItem key={item.toISOString()} value={item.toISOString()}>
              {format(item)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export { TimePicker };
