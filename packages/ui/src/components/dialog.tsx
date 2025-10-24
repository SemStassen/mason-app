// Source: 9ui

import { Dialog as BaseDialog } from "@base-ui-components/react";
import type * as React from "react";

import { cn } from "../utils";
import { Icons } from "./icons";

function Dialog({ ...props }: React.ComponentProps<typeof BaseDialog.Root>) {
  return <BaseDialog.Root data-slot="dialog" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof BaseDialog.Portal>) {
  return <BaseDialog.Portal data-slot="dialog-portal" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof BaseDialog.Trigger>) {
  return <BaseDialog.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof BaseDialog.Close>) {
  return <BaseDialog.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof BaseDialog.Backdrop>) {
  return (
    <BaseDialog.Backdrop
      className={cn(
        "fixed inset-0 z-[49] bg-black/50 transition-all duration-200 [&[data-ending-style]]:opacity-0 [&[data-starting-style]]:opacity-0",
        className
      )}
      data-slot="dialog-overlay"
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  withCloseButton = true,
  ...props
}: React.ComponentProps<typeof BaseDialog.Popup> & {
  withCloseButton?: boolean;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <BaseDialog.Popup
        className={cn(
          "fixed z-50 grid w-full bg-popover text-popover-foreground sm:max-w-[calc(100%-2rem)]",
          "gap-4 rounded-lg border p-6 shadow-lg outline-none duration-200 sm:max-w-lg sm:scale-[calc(1-0.1*var(--nested-dialogs))]",
          "fixed bottom-0 w-full sm:top-[50%] sm:bottom-auto sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%]",
          "duration-200",
          "data-[starting-style]:translate-y-full data-[starting-style]:opacity-0",
          "data-[ending-style]:translate-y-full data-[ending-style]:opacity-0",
          "data-[starting-style]:sm:translate-y-[-50%] data-[starting-style]:sm:scale-95",
          "data-[ending-style]:sm:translate-y-[-50%] data-[ending-style]:sm:scale-95",
          className
        )}
        data-slot="dialog-content"
        {...props}
      >
        {children}
        {withCloseButton && (
          <BaseDialog.Close className="absolute top-4 right-4 rounded-xs text-muted-foreground opacity-50 ring-offset-popover transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-[3px] focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0">
            <Icons.X />
            <span className="sr-only">Close</span>
          </BaseDialog.Close>
        )}
      </BaseDialog.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      data-slot="dialog-header"
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      data-slot="dialog-footer"
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof BaseDialog.Title>) {
  return (
    <BaseDialog.Title
      className={cn("font-semibold text-lg leading-none", className)}
      data-slot="dialog-title"
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof BaseDialog.Description>) {
  return (
    <BaseDialog.Description
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="dialog-description"
      {...props}
    />
  );
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
