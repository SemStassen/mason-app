import * as TogglePrimitive from "@radix-ui/react-toggle";
import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "../utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary hover:bg-primary/90",
        outline: "border border-input bg-transparent hover:bg-contrast-5",
      },
      size: {
        default: "h-9 min-w-9 px-2",
        sm: "h-8 min-w-8 px-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ToggleProps
  extends React.ComponentProps<typeof TogglePrimitive.Root>,
    VariantProps<typeof toggleVariants> {}

const Toggle = ({ className, variant, size, ...props }: ToggleProps) => (
  <TogglePrimitive.Root
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
);

export { Toggle, toggleVariants };
