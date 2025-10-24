// Source: 9ui

import { Switch as BaseSwitch } from "@base-ui-components/react/switch";
import type * as React from "react";

import { cn } from "../utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof BaseSwitch.Root>) {
  return (
    <BaseSwitch.Root
      className={cn(
        "peer inline-flex h-5 w-8 shrink-0 items-center rounded-full border shadow-xs outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-checked:bg-primary data-unchecked:bg-input",
        className
      )}
      data-slot="switch"
      {...props}
    >
      <BaseSwitch.Thumb
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-foreground ring-0 transition-transform duration-300 ease-in-out data-checked:translate-x-[calc(100%-3px)] data-unchecked:translate-x-px data-checked:bg-background"
        )}
        data-slot="switch-thumb"
      />
    </BaseSwitch.Root>
  );
}

export { Switch };
