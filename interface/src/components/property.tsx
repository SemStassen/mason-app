import { cn } from "@mason/ui/utils";
import type React from "react";

function Property({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center", className)} {...props} />;
}

function PropertyLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("w-20 shrink-0 text-contrast-50 text-sm", className)}
      {...props}
    />
  );
}

function PropertyContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={className} {...props} />;
}

export { Property, PropertyLabel, PropertyContent };
