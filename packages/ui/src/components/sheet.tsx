import { Dialog as BaseSheet } from '@base-ui-components/react/dialog';
import type * as React from 'react';

import { cn } from '../utils';
import { Icons } from './icons';

function Sheet({ ...props }: React.ComponentProps<typeof BaseSheet.Root>) {
  return <BaseSheet.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof BaseSheet.Trigger>) {
  return <BaseSheet.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof BaseSheet.Close>) {
  return <BaseSheet.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof BaseSheet.Portal>) {
  return <BaseSheet.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof BaseSheet.Backdrop>) {
  return (
    <BaseSheet.Backdrop
      className={cn(
        'fixed inset-0 bg-black/50 transition-all duration-200 [&[data-ending-style]]:opacity-0 [&[data-starting-style]]:opacity-0',
        className
      )}
      data-slot="sheet-overlay"
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = 'right',
  ...props
}: React.ComponentProps<typeof BaseSheet.Popup> & {
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <BaseSheet.Popup
        className={cn(
          'fixed z-50 flex max-h-[calc(100vh-2rem)] flex-col gap-4 rounded-lg bg-popover text-popover-foreground shadow-lg outline-hidden transition ease-in-out data-closed:duration-300 data-open:duration-500',
          side === 'right' &&
            '-translate-x-4 inset-y-0 top-4 right-0 h-full w-3/4 origin-right border sm:max-w-sm [&[data-ending-style]]:translate-x-full [&[data-starting-style]]:translate-x-full',
          side === 'left' &&
            '[&[data-ending-style]]:-translate-x-full [&[data-starting-style]]:-translate-x-full inset-y-0 top-4 left-0 h-full w-3/4 origin-left translate-x-4 border sm:max-w-sm',
          side === 'top' &&
            '[&[data-ending-style]]:-translate-y-full [&[data-starting-style]]:-translate-y-full inset-x-0 top-0 mx-auto h-auto w-[calc(100vw-2rem)] origin-top translate-y-4 border',
          side === 'bottom' &&
            '-translate-y-4 inset-x-0 bottom-0 mx-auto h-auto w-[calc(100vw-2rem)] origin-bottom border [&[data-ending-style]]:translate-y-full [&[data-starting-style]]:translate-y-full',
          className
        )}
        data-slot="sheet-content"
        {...props}
      >
        {children}
        <SheetClose className="absolute top-4 right-4 rounded-xs text-muted-foreground opacity-50 ring-offset-popover transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-[3px] focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0">
          <Icons.X className="size-4" />
          <span className="sr-only">Close</span>
        </SheetClose>
      </BaseSheet.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 p-4', className)}
      data-slot="sheet-header"
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof BaseSheet.Title>) {
  return (
    <BaseSheet.Title
      className={cn('font-semibold text-foreground', className)}
      data-slot="sheet-title"
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof BaseSheet.Description>) {
  return (
    <BaseSheet.Description
      className={cn('text-muted-foreground text-sm', className)}
      data-slot="sheet-description"
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      data-slot="sheet-footer"
      {...props}
    />
  );
}

export {
  Sheet,
  SheetOverlay,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
};
