// Source: 9ui

import type * as React from "react";

import { cn } from "../utils";

function Kbd({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex h-5 w-5 items-center justify-center rounded-sm border bg-background text-center font-medium text-xs tracking-tight shadow-sm",
        className
      )}
      data-slot="kbd"
      {...props}
    />
  );
}

export { Kbd };
