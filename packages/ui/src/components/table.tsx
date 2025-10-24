import { mergeProps, useRender } from "@base-ui-components/react";
import type * as React from "react";
import { cn } from "../utils";

function Table({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden text-sm",
        className
      )}
      data-slot="table"
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex h-10 items-center whitespace-nowrap p-2 font-medium text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      data-slot="table-head"
      {...props}
    />
  );
}

function TableRow({
  render,
  className,
  ...props
}: useRender.ComponentProps<"div">) {
  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn(
          "flex w-full border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
          className
        ),
      },
      props
    ),
  });

  return element;
}

function TableBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "h-full overflow-y-auto [&_tr:last-child]:border-0",
        className
      )}
      data-slot="table-body"
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center whitespace-nowrap p-2 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      data-slot="table-cell"
      {...props}
    />
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex [&_tr]:border-b", className)}
      data-slot="table-header"
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      data-slot="table-footer"
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-4 text-muted-foreground text-xs", className)}
      data-slot="table-caption"
      {...props}
    />
  );
}

export {
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableHeader,
  TableFooter,
  TableCaption,
};
