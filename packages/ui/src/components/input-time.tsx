import { useEffect, useState } from "react";
import { type ChronoLocale, chronoParse } from "../utils";
import { Input, type InputProps } from "./input.coss";

export interface InputTimeProps
  extends Omit<InputProps, "value" | "onChange" | "defaultValue"> {
  format: (date: Date) => string;
  locale?: ChronoLocale;
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (value: Date | null) => void;
}

function InputTime({
  value,
  defaultValue,
  onChange,
  format,
  locale,
  ...props
}: InputTimeProps) {
  const [internalValue, setInternalValue] = useState<Date | null>(
    defaultValue ?? null
  );

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const [text, setText] = useState(currentValue ? format(currentValue) : "");

  useEffect(() => {
    setText(currentValue ? format(currentValue) : "");
  }, [currentValue, format]);

  function commit() {
    const raw = text.trim();

    // empty → null
    if (!raw) {
      if (!isControlled) {
        setInternalValue(null);
      }
      onChange?.(null);
      return;
    }

    const parsed = chronoParse({
      text: raw,
      ref: currentValue ?? new Date(),
      locale,
    });

    if (parsed) {
      if (!isControlled) {
        setInternalValue(parsed);
      }
      onChange?.(parsed);
      setText(format(parsed));
    } else {
      // Failed parse: keep text, user can continue editing
      // (no auto-revert)
    }
  }

  return (
    <Input
      {...props}
      autoComplete="off"
      onBlur={commit}
      onChange={(e) => setText(e.target.value)}
      spellCheck={false}
      type="text"
      value={text}
    />
  );
}

export { InputTime };
