import { Separator as BaseSeparator } from '@base-ui-components/react/separator';
import type * as React from 'react';

import { cn } from '../utils';

function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof BaseSeparator>) {
  return (
    <BaseSeparator
      className={cn(
        'shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px',
        className
      )}
      data-slot="separator"
      orientation={orientation}
      {...props}
    />
  );
}

export { Separator };
