import { Avatar as AvatarBase } from "@base-ui-components/react/avatar";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../utils";

const avatarVariants = cva("relative flex shrink-0 overflow-hidden", {
  variants: {
    rounded: {
      lg: "rounded-lg",
      full: "rounded-full",
    },
    size: {
      sm: "size-6 text-xs",
      md: "size-10",
      lg: "size-12 text-lg",
    },
  },
  defaultVariants: {
    rounded: "full",
    size: "md",
  },
});

function Avatar({
  className,
  rounded,
  size,
  ...props
}: React.ComponentProps<typeof AvatarBase.Root> &
  VariantProps<typeof avatarVariants>) {
  return (
    <AvatarBase.Root
      className={cn(avatarVariants({ rounded, size }), className)}
      data-slot="avatar"
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarBase.Image>) {
  return (
    <AvatarBase.Image
      className={cn("size-full object-cover", className)}
      data-slot="avatar-image"
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarBase.Fallback>) {
  return (
    <AvatarBase.Fallback
      className={cn(
        "flex size-full select-none items-center justify-center bg-white",
        className
      )}
      data-slot="avatar-fallback"
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
