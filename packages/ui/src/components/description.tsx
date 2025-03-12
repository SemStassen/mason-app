import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../utils";

const DescriptionVariants = cva("text-xs leading-none");

export interface DescriptionProps
  extends React.ComponentProps<"p">,
    VariantProps<typeof DescriptionVariants> {}

const Description = ({ className, ...props }: DescriptionProps) => {
  return <p className={cn(DescriptionVariants(), className)} {...props} />;
};

export { Description };
