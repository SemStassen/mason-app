import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import type { VariantProps } from "class-variance-authority";
import { cn } from "~/utils";
import { Button, type buttonVariants } from "./button";
import { Icons } from "./icons";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = ({
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Trigger> &
  VariantProps<typeof buttonVariants>) => (
  <CollapsiblePrimitive.Trigger asChild {...props}>
    <Button variant={variant} size={size} className="group/collapsible-trigger">
      {children}
      <Icons.ChevronDown
        weight="fill"
        className="group-data-[state='open']/collapsible-trigger:-rotate-90 transition-[rotate]"
      />
    </Button>
  </CollapsiblePrimitive.Trigger>
);

const CollapsibleContent = ({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Content>) => (
  <CollapsiblePrimitive.Content
    className={cn(
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down [&>*]:first:py-4",
      className,
    )}
    {...props}
  />
);

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
