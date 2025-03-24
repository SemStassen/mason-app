import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../utils";

const inputVariants = cva(
  "w-full cursor-pointer bg-transparent text-foreground text-sm transition-colors placeholder:text-contrast-50 focus:cursor-text",
  {
    variants: {
      size: {
        default: "h-9",
        sm: "h-8",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  IconLeft?: React.ReactNode;
}

const Input = ({ className, type, size, IconLeft, ...props }: InputProps) => {
  return (
    <div className="relative flex rounded-md border text-contrast-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
      {IconLeft && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          {IconLeft}
        </div>
      )}
      <input
        type={type}
        className={cn(inputVariants({ size }), IconLeft ? "pr-3 pl-9" : "px-3")}
        {...props}
      />
    </div>
  );
};

export { Input };
