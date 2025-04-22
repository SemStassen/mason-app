import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "../utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = ({
  className,
  side = "bottom",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      side={side}
      sideOffset={sideOffset}
      className={cn(
        "fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 animate-in overflow-hidden rounded-md bg-popover/75 px-2.5 py-1.5 text-foreground text-xs shadow-md ring ring-contrast-5 backdrop-blur-md data-[state=closed]:animate-out",
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
);

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
