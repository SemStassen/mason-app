import { cn } from "../utils";

const Hotkey = ({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) => {
  return (
    <span
      className={cn(
        "flex-none whitespace-nowrap align-baseline text-[0.6rem] leading-[1em]",
        className,
      )}
      {...props}
    >
      <kbd className="inline-block min-w-[2ch] rounded-xs bg-contrast-10 p-1 pr-[5px] text-center">
        {children}
      </kbd>
    </span>
  );
};

export { Hotkey };
