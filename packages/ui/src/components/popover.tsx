import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "../utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = ({
  className,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) => (
  <PopoverPrimitive.Trigger
    className={cn("group/trigger", className)}
    {...props}
  />
);

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = ({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      align={align}
      sideOffset={sideOffset}
      onClick={(e) => {
        // Allows buttons inside the popover to be clicked without closing the popover
        e.stopPropagation();
        props.onClick?.(e);
      }}
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-md bg-popover/75 p-4 text-foreground outline-none ring ring-contrast-5 backdrop-blur-md data-[state=closed]:animate-out data-[state=open]:animate-in",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
);

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
