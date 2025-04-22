import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "../utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium text-sm outline-none transition-colors focus-visible:ring focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/80",
        contrast: "bg-contrast-10 text-contrast-60",
        ghost:
          "bg-transparent text-contrast-75 hover:bg-contrast-10 hover:text-contrast-90 group-data-[state='open']/trigger:bg-contrast-10",
        outline:
          "bg-background text-contrast-75 ring ring-border hover:bg-contrast-5 hover:text-contrast-90",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 gap-1 px-3 text-xs",
        icon: "h-8 w-8 px-0.5 py-0.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = ({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};

export { Button, buttonVariants };
