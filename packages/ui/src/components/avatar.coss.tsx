import { Avatar as AvatarPrimitive } from "@base-ui-components/react/avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils";

const avatarVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center overflow-hidden bg-background align-middle font-medium text-xs",
  {
    variants: {
      size: {
        default: "size-8",
        sm: "size-6",
      },
      rounded: {
        full: "rounded-full",
        lg: "rounded-lg",
      },
    },
    defaultVariants: {
      size: "default",
      rounded: "full",
    },
  }
);

function Avatar({
  className,
  rounded,
  size,
  ...props
}: AvatarPrimitive.Root.Props & VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      className={cn(avatarVariants({ className, size, rounded }))}
      data-slot="avatar"
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      className={cn("size-full object-cover", className)}
      data-slot="avatar-image"
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex size-full items-center justify-center bg-muted",
        className
      )}
      data-slot="avatar-fallback"
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
