import { cn } from "@mason/ui/utils";
import { Slot } from "@radix-ui/react-slot";

function List({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("grow overflow-auto pb-16", className)} {...props} />
  );
}

function ListHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex h-11 items-center justify-between border-contrast-10 border-b bg-accent pr-4 pl-9.5 text-contrast-75",
        className,
      )}
      {...props}
    />
  );
}

function ListContent({ ...props }: React.ComponentProps<"ul">) {
  return <ul {...props} />;
}

function ListItem({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"li"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "li";

  return (
    <Comp
      className={cn(
        "mx-px not-last:border-b px-4 py-6 focus-within:ring focus-within:ring-primary has-[>a]:p-0 [&>a]:px-4 [&>a]:py-6 [&>a]:focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export { List, ListHeader, ListContent, ListItem };
