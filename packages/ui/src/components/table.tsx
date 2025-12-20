import { mergeProps, useRender } from "@base-ui-components/react";
import type * as React from "react";
import { cn } from "../utils";

function Table({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative flex h-full in-data-[slot=frame]:border-separate in-data-[slot=frame]:border-spacing-0 flex-col overflow-hidden text-sm",
        className
      )}
      data-slot="table"
      {...props}
    />
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "h-10 [&_data-[slot=table-row]]:border-b in-data-[slot=frame]:**:[data-[slot=table-head]]:h-9 in-data-[slot=frame]:*:[data-[slot=table-row]]:border-none in-data-[slot=frame]:*:[data-[slot=table-row]]:hover:bg-transparent",
        className
      )}
      data-slot="table-header"
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative h-full overflow-y-auto in-data-[slot=frame]:rounded-xl in-data-[slot=frame]:shadow-xs before:pointer-events-none before:absolute before:inset-px not-in-data-[slot=frame]:before:hidden before:rounded-[calc(var(--radius-xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:bg-clip-border dark:before:shadow-[0_-1px_--theme(--color-white/8%)] [&_tr:last-child]:border-0 in-data-[slot=frame]:*:[data-[slot=table-row]]:border-0 in-data-[slot=frame]:*:[data-[slot=table-row]]:*:[data-[slot=table-cell]]:border-b in-data-[slot=frame]:*:[data-[slot=table-row]]:*:[data-[slot=table-cell]]:bg-card in-data-[slot=frame]:*:[data-[slot=table-row]]:*:[data-[slot=table-cell]]:bg-clip-padding in-data-[slot=frame]:*:[data-[slot=table-row]]:first:*:[data-[slot=table-cell]]:first:rounded-ss-xl in-data-[slot=frame]:*:[data-[slot=table-row]]:*:[data-[slot=table-cell]]:first:border-s in-data-[slot=frame]:*:[data-[slot=table-row]]:first:*:[data-[slot=table-cell]]:border-t in-data-[slot=frame]:*:[data-[slot=table-row]]:last:*:[data-[slot=table-cell]]:last:rounded-ee-xl in-data-[slot=frame]:*:[data-[slot=table-row]]:*:[data-[slot=table-cell]]:last:border-e in-data-[slot=frame]:*:[data-[slot=table-row]]:first:*:[data-[slot=table-cell]]:last:rounded-se-xl in-data-[slot=frame]:*:[data-[slot=table-row]]:last:*:[data-[slot=table-cell]]:first:rounded-es-xl in-data-[slot=frame]:*:[data-[slot=table-row]]:hover:*:[data-[slot=table-cell]]:bg-muted/32",
        className
      )}
      data-slot="table-body"
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "border-t in-data-[slot=frame]:border-none bg-muted/72 in-data-[slot=frame]:bg-data-[slot=table-row]ansparent font-medium [&>data-[slot=table-row]]:last:border-b-0 in-data-[slot=frame]:*:[data-[slot=table-row]]:hover:bg-transparent",
        className
      )}
      data-slot="table-footer"
      {...props}
    />
  );
}

interface TableRowProps extends useRender.ComponentProps<"div"> {}

function TableRow({ className, render, ...props }: TableRowProps) {
  const defaultProps = {
    "data-slot": "table-row",
    className: cn(
      "flex h-full w-full items-center border-b transition-colors hover:bg-muted in-data-[slot=frame]:hover:bg-transparent data-[state=selected]:bg-muted in-data-[slot=frame]:data-[state=selected]:bg-transparent",
      className
    ),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

function TableHead({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "font-medium has-[[role=checkbox]]:pe-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      data-slot="table-head"
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center whitespace-nowrap p-2 has-[[role=checkbox]]:pe-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      data-slot="table-cell"
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "in-data-[slot=frame]:my-4 mt-4 text-muted-foreground text-sm",
        className
      )}
      data-slot="table-caption"
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
