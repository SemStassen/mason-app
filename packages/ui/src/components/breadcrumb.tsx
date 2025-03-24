import { Slot } from "@radix-ui/react-slot";
import type * as React from "react";

import { cn } from "../utils";
import { Icons } from "./icons";

const Breadcrumb = ({ ...props }: React.ComponentProps<"span">) => (
  <nav aria-label="breadcrumb" {...props} />
);

const BreadcrumbList = ({
  className,
  ...props
}: React.ComponentProps<"ol">) => (
  <ol
    className={cn(
      "flex flex-wrap items-center gap-1.5 break-words text-sm sm:gap-2.5",
      className,
    )}
    {...props}
  />
);

const BreadcrumbItem = ({
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
);

const BreadcrumbLink = ({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
}) => {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      className={cn(
        "flex items-center gap-2 text-contrast-60 transition-colors hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
};

const BreadcrumbPage = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  // biome-ignore lint/a11y/useFocusableInteractive: It is disabled
  <span
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("flex items-center gap-2 text-foreground", className)}
    {...props}
  />
);

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("text-contrast-60 [&>svg]:h-3.5 [&>svg]:w-3.5", className)}
    {...props}
  >
    {children ?? <Icons.ChevronRight />}
  </li>
);

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <Icons.DotsThreeHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
);

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
