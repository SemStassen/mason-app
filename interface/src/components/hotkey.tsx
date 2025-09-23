import { Kbd } from "@mason/ui/kbd";

const HOTKEY_DISPLAY_MAP: Record<string, string> = {
  bracketleft: "[",
  bracketright: "]",
  semicolon: ";",
  quote: "'",
  backslash: "\\",
  comma: ",",
  period: ".",
  slash: "/",
  backtick: "`",
  equal: "=",
  minus: "-",
  space: "Space",
  enter: "Enter",
  escape: "Esc",
  tab: "Tab",
  backspace: "Backspace",
  delete: "Delete",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
};

function formatKey(key: string): string {
  return HOTKEY_DISPLAY_MAP[key] || key;
}

function Hotkey({ children }: { children: string }) {
  const steps = children.split(">");

  return (
    <>
      {steps.map((step, stepIndex) => {
        const keys = step.split("+");

        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: Fine here
          <span className="inline-flex items-center gap-1" key={stepIndex}>
            {keys.map((key, keyIndex) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Fine here
              <span key={keyIndex}>
                <Kbd>{formatKey(key)}</Kbd>
                {keyIndex < keys.length - 1 && " + "}
              </span>
            ))}
            {stepIndex < steps.length - 1 && " then "}
          </span>
        );
      })}
    </>
  );
}

export { Hotkey };
