import type React from "react";

import { cn } from "#utils/cn";

import { Icons } from "./icons";
import type { IconProps } from "./icons";

export function Spinner({
  className,
  ...props
}: IconProps): React.ReactElement {
  return (
    <Icons.Spinner
      aria-label="Loading"
      className={cn("animate-spin", className)}
      role="status"
      {...props}
    />
  );
}
