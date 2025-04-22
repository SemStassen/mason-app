import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../utils";

const inputVariants = cva(
  "relative flex w-full rounded-md bg-transparent text-contrast-50 text-sm disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-transparent focus-within:bg-contrast-5 hover:bg-contrast-5",
        outline:
          "border border-input focus-within:ring focus-within:ring-primary focus-visible:outline-none",
      },
      size: {
        default: "h-9",
        sm: "h-8",
        lg: "h-11 font-semibold text-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Input = ({
  className,
  type,
  variant,
  size,
  iconLeft,
  iconRight,
  ...props
}: InputProps) => {
  return (
    <div className={cn(inputVariants({ variant, size, className }))}>
      {iconLeft && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          {iconLeft}
        </div>
      )}
      <input
        type={type}
        className={cn(
          "w-full cursor-default px-3 text-foreground placeholder:text-contrast-50 focus:cursor-text focus:outline-none",
          iconLeft && "pl-9",
          iconRight && "pr-9",
        )}
        {...props}
      />
      {iconRight && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {iconRight}
        </div>
      )}
    </div>
  );
};

export { Input };
