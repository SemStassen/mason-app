import { ScrollArea as BaseScrollArea } from '@base-ui-components/react/scroll-area';
import type * as React from 'react';

import { cn } from '../utils';

function ScrollArea({
  className,
  children,
  orientation,
  ...props
}: React.ComponentProps<typeof BaseScrollArea.Root> & {
  orientation: 'horizontal' | 'vertical';
}) {
  return (
    <BaseScrollArea.Root
      className={cn('relative', className)}
      data-slot="scroll-area"
      {...props}
    >
      <BaseScrollArea.Viewport
        className="size-full overscroll-contain rounded-[inherit] outline-none transition-[color,box-shadow] focus-visible:outline focus-visible:ring-[3px] focus-visible:ring-ring/50"
        data-slot="scroll-area-viewport"
      >
        {children}
      </BaseScrollArea.Viewport>
      <ScrollBar orientation={orientation} />
      <BaseScrollArea.Corner />
    </BaseScrollArea.Root>
  );
}

function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof BaseScrollArea.Scrollbar>) {
  return (
    <BaseScrollArea.Scrollbar
      className={cn(
        'm-1 flex touch-none select-none p-px opacity-0 transition-[colors,opacity] delay-200 data-hovering:opacity-100 data-scrolling:opacity-100 data-hovering:delay-0 data-scrolling:delay-0 data-hovering:duration-100 data-scrolling:duration-100',
        orientation === 'vertical' && 'w-2.5 border-l border-l-transparent',
        orientation === 'horizontal' &&
          'h-2.5 flex-col border-t border-t-transparent',
        className
      )}
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      {...props}
    >
      <BaseScrollArea.Thumb
        className="relative flex-1 rounded-full bg-border"
        data-slot="scroll-area-thumb"
      />
    </BaseScrollArea.Scrollbar>
  );
}

export { ScrollArea };
