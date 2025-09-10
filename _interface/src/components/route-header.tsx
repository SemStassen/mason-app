import { cn } from "@mason/ui/utils";
import { observer } from "mobx-react-lite";
import { rootStore } from "~/stores/root-store";

const RouteHeader = observer(
  ({ children, className, ...props }: React.ComponentProps<"header">) => {
    const { uiStore } = rootStore;

    return (
      <header
        className={cn(
          "flex h-12 shrink-0 items-center justify-between border-b text-foreground text-sm transition-[padding]",
          className,
        )}
        style={{
          paddingLeft: uiStore.isSidebarOpen ? 16 : 52,
          paddingRight: 18,
        }}
        {...props}
      >
        {children}
      </header>
    );
  },
);

export { RouteHeader };
