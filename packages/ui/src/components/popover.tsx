// Source: 9ui

import { Popover as BasePopover } from "@base-ui-components/react/popover";
import type * as React from "react";

import { cn } from "../utils";

function Popover({ ...props }: React.ComponentProps<typeof BasePopover.Root>) {
  return <BasePopover.Root data-slot="popover" {...props} />;
}

function PopoverPortal({
  ...props
}: React.ComponentProps<typeof BasePopover.Portal>) {
  return <BasePopover.Portal data-slot="popover-portal" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof BasePopover.Trigger>) {
  return <BasePopover.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverClose({
  ...props
}: React.ComponentProps<typeof BasePopover.Close>) {
  return <BasePopover.Close data-slot="popover-close" {...props} />;
}

function PopoverArrow({
  ...props
}: React.ComponentProps<typeof BasePopover.Arrow>) {
  return <BasePopover.Arrow data-slot="popover-arrow" {...props} />;
}

function PopoverPositioner({
  ...props
}: React.ComponentProps<typeof BasePopover.Positioner>) {
  return (
    <BasePopover.Positioner
      className="z-50"
      data-slot="popover-positioner"
      {...props}
    />
  );
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("relative flex flex-col gap-y-1", className)}
      data-slot="popover-header"
      {...props}
    />
  );
}

function PopoverTitle({
  className,
  ...props
}: React.ComponentProps<typeof BasePopover.Title>) {
  return (
    <BasePopover.Title
      className={cn("font-semibold text-sm", className)}
      data-slot="popover-title"
      {...props}
    />
  );
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<typeof BasePopover.Description>) {
  return (
    <BasePopover.Description
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="popover-description"
      {...props}
    />
  );
}

function PopoverContent({
  children,
  className,
  align = "center",
  sideOffset = 8,
  arrow = true,
  ...props
}: React.ComponentProps<typeof BasePopover.Popup> & {
  align?: BasePopover.Positioner.Props["align"];
  sideOffset?: BasePopover.Positioner.Props["sideOffset"];
  arrow?: boolean;
}) {
  return (
    <PopoverPortal>
      <PopoverPositioner align={align} sideOffset={sideOffset}>
        <BasePopover.Popup
          className={cn(
            "-outline-offset-1 w-72 origin-[var(--transform-origin)] rounded-md bg-popover p-4 text-popover-foreground shadow-md outline outline-border transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
            className
          )}
          data-slot="popover-content"
          {...props}
        >
          {arrow && (
            <PopoverArrow className="data-[side=right]:-rotate-90 data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=top]:bottom-[-8px] data-[side=right]:left-[-13px] data-[side=left]:rotate-90 data-[side=top]:rotate-180">
              {/* biome-ignore lint/a11y/noSvgWithoutTitle: Fine for now */}
              <svg fill="none" height="10" viewBox="0 0 20 10" width="20">
                <path
                  className="fill-popover"
                  d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V9H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
                />
                <path
                  className="fill-border"
                  d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
                />
              </svg>
            </PopoverArrow>
          )}
          {children}
        </BasePopover.Popup>
      </PopoverPositioner>
    </PopoverPortal>
  );
}

function PopoverFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      data-slot="popover-footer"
      {...props}
    />
  );
}

export {
  Popover,
  PopoverTrigger,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverContent,
  PopoverFooter,
  PopoverClose,
  PopoverArrow,
  PopoverPositioner,
  PopoverPortal,
};
