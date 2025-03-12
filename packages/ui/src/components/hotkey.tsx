import { cn } from "../utils";

const Hotkey = ({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) => {
  return (
    <span
      className={cn(
        "whitespace-nowrap align-baseline text-[0.6rem] flex-none leading-[1em]",
        className,
      )}
      {...props}
    >
      <kbd className="bg-contrast-10 text-center rounded-xs p-1 pr-[5px] inline-block min-w-[2ch]">
        {children}
      </kbd>
    </span>
  );
};

export { Hotkey };
