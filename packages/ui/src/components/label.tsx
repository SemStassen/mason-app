import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '../utils';

const labelVariants = cva(
  'font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

export interface LabelProps
  extends React.ComponentProps<'label'>,
    VariantProps<typeof labelVariants> {}

const Label = ({
  className,
  'aria-label': ariaLabel,
  htmlFor,
  ...props
}: LabelProps) => {
  // biome-ignore lint/a11y/noLabelWithoutControl: Fine for now
  return <label className={cn(labelVariants(), className)} {...props} />;
};

export { Label, labelVariants };
