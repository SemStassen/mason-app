import { Accordion as BaseAccordion } from "@base-ui-components/react/accordion";

import { cn } from "../utils";
import { Icons } from "./icons";

function Accordion({
  ...props
}: React.ComponentProps<typeof BaseAccordion.Root>) {
  return <BaseAccordion.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof BaseAccordion.Item>) {
  return (
    <BaseAccordion.Item
      className={cn("border-b last:border-b-0", className)}
      data-slot="accordion-item"
      {...props}
    />
  );
}

function AccordionTrigger({
  children,
  className,
  ...props
}: React.ComponentProps<typeof BaseAccordion.Trigger>) {
  return (
    <BaseAccordion.Header className="flex">
      <BaseAccordion.Trigger
        className={cn(
          "flex flex-1 items-center justify-between gap-4 rounded-md py-3 text-left font-medium text-sm underline-offset-2 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[panel-open]:[&_*[data-slot=accordion-icon]]:rotate-180",
          className
        )}
        data-slot="accordion-trigger"
        {...props}
      >
        {children}
        <Icons.ChevronDown
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200"
          data-slot="accordion-icon"
        />
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  );
}

function AccordionContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof BaseAccordion.Panel>) {
  return (
    <BaseAccordion.Panel
      className="h-[var(--accordion-panel-height)] overflow-hidden text-sm transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0"
      data-slot="accordion-content"
      {...props}
    >
      <div className={cn("pb-2.5", className)}>{children}</div>
    </BaseAccordion.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
