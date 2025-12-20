import type * as React from "react";
import { cn } from "../utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: This should happem when the component is used
    <label
      className={cn("inline-flex items-center gap-2 text-sm/4", className)}
      data-slot="label"
      {...props}
    />
  );
}

export { Label };
