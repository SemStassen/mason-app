import type * as React from "react";

import { cn } from "../utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control -- Control association is provided by the caller
    <label
      className={cn("inline-flex items-center gap-2 text-sm/4", className)}
      data-slot="label"
      {...props}
    />
  );
}

export { Label };
