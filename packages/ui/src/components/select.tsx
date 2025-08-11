import { Select as BaseSelect } from '@base-ui-components/react/select';
import type * as React from 'react';

import { cn } from '../utils';
import { Icons } from './icons';

function Select({ ...props }: React.ComponentProps<typeof BaseSelect.Root>) {
  return <BaseSelect.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof BaseSelect.Group>) {
  return <BaseSelect.Group data-slot="select-group" {...props} />;
}

function SelectPortal({
  ...props
}: React.ComponentProps<typeof BaseSelect.Portal>) {
  return <BaseSelect.Portal data-slot="select-portal" {...props} />;
}

function SelectPositioner({
  ...props
}: React.ComponentProps<typeof BaseSelect.Positioner>) {
  return <BaseSelect.Positioner data-slot="select-positioner" {...props} />;
}

function SelectValue({
  className,
  ...props
}: React.ComponentProps<typeof BaseSelect.Value>) {
  return (
    <BaseSelect.Value
      className={cn('text-sm', className)}
      data-slot="select-value"
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: React.ComponentProps<typeof BaseSelect.Trigger> & {
  size?: 'sm' | 'default';
}) {
  return (
    <BaseSelect.Trigger
      className={cn(
        "flex w-fit select-none items-center justify-between gap-2 whitespace-nowrap rounded-md border bg-input px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-size={size}
      data-slot="select-trigger"
      {...props}
    >
      {children}
      <BaseSelect.Icon>
        <Icons.ChevronDown className="size-4 opacity-50" />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

function SelectContent({
  className,
  children,
  sideOffset = 4,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof BaseSelect.Popup> & {
  sideOffset?: BaseSelect.Positioner.Props['sideOffset'];
  position?: 'popper' | 'item-aligned';
}) {
  return (
    <SelectPortal>
      <SelectPositioner
        alignItemWithTrigger={position === 'item-aligned'}
        sideOffset={sideOffset}
      >
        <SelectScrollUpButton />
        <BaseSelect.Popup
          className={cn(
            'relative z-50 max-h-[var(--available-height)] w-[var(--anchor-width)] min-w-[8rem] origin-[var(--transform-origin)] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0',
            className
          )}
          data-slot="select-content"
          {...props}
        >
          {children}
        </BaseSelect.Popup>
        <SelectScrollDownButton />
      </SelectPositioner>
    </SelectPortal>
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseSelect.Item>) {
  return (
    <BaseSelect.Item
      className={cn(
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden data-[disabled]:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      data-slot="select-item"
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <BaseSelect.ItemIndicator>
          <Icons.Check className="size-4" />
        </BaseSelect.ItemIndicator>
      </span>
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
    </BaseSelect.Item>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof BaseSelect.GroupLabel>) {
  return (
    <BaseSelect.GroupLabel
      className={cn(
        'px-2 py-1.5 font-medium text-muted-foreground text-xs',
        className
      )}
      data-slot="select-label"
      {...props}
    />
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof BaseSelect.Separator>) {
  return (
    <BaseSelect.Separator
      className={cn('-mx-1 pointer-events-none my-1 h-px bg-border', className)}
      data-slot="select-separator"
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof BaseSelect.ScrollUpArrow>) {
  return (
    <BaseSelect.ScrollUpArrow
      className={cn(
        'top-px left-[1px] z-[100] flex w-[calc(100%-2px)] cursor-default items-center justify-center rounded-t-md bg-popover py-1',
        className
      )}
      data-slot="select-scroll-up-button"
      {...props}
    >
      <Icons.ChevronUp className="size-4" />
    </BaseSelect.ScrollUpArrow>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof BaseSelect.ScrollDownArrow>) {
  return (
    <BaseSelect.ScrollDownArrow
      className={cn(
        'bottom-px left-[1px] z-[100] flex w-[calc(100%-2px)] cursor-default items-center justify-center rounded-b-md bg-popover py-1',
        className
      )}
      data-slot="select-scroll-down-button"
      {...props}
    >
      <Icons.ChevronDown className="size-4" />
    </BaseSelect.ScrollDownArrow>
  );
}

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
};
