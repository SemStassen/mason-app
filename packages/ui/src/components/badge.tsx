import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "../utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        outline: "text-foreground",
        contrast: "bg-contrast-10 text-contrast-60",
        ghost: "text-contrast-75 hover:bg-contrast-10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
