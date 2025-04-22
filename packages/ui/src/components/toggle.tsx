import * as TogglePrimitive from "@radix-ui/react-toggle";
import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "../utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium text-sm outline-none transition-colors focus-visible:ring focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 [&>div]:rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/80",
        ghost:
          "bg-transparent text-contrast-75 [&>div]:hover:bg-contrast-10 [&>div]:hover:text-contrast-90 [&[data-state='on']>div]:bg-contrast-10 [&[data-state='on']>div]:text-contrast-90",
        outline:
          "border border-input bg-transparent text-contrast-90 hover:bg-contrast-5 data-[state='on']:bg-contrast-10 data-[state='on']:text-foreground",
      },
      size: {
        default: "h-9 min-w-9 px-2",
        sm: "h-8 min-w-8 px-2 text-xs",
        icon: "h-8 w-8 px-0.5 py-0.5 text-sm [&>div]:h-7 [&>div]:w-7",
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

const Toggle = ({
  children,
  className,
  variant,
  size,
  ...props
}: ToggleProps) => (
  <TogglePrimitive.Root
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  >
    <div className="flex items-center justify-center">{children}</div>
  </TogglePrimitive.Root>
);

export { Toggle, toggleVariants };
