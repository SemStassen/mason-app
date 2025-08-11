import { Tabs as BaseTabs } from '@base-ui-components/react/tabs';
import { createContext, useContext } from 'react';
import { cn } from '../utils';

type TabsVariant = 'capsule' | 'underline';

type TabsContext = {
  variant: TabsVariant;
};

const TabsContext = createContext<TabsContext | null>(null);

const useTabs = () => {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error('useTabs must be used within a Tabs');
  }

  return context;
};

function Tabs({
  variant = 'capsule',
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Root> & {
  variant?: TabsVariant;
}) {
  return (
    <TabsContext.Provider value={{ variant }}>
      <BaseTabs.Root
        className={cn('flex flex-col gap-2', className)}
        data-slot="tabs"
        {...props}
      />
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseTabs.List>) {
  const { variant } = useTabs();

  return (
    <BaseTabs.List
      className={cn(
        'relative z-0 inline-flex h-9 w-fit items-center justify-center gap-x-1 p-1 text-muted-foreground',
        variant === 'capsule' ? 'rounded-lg bg-muted' : '',
        className
      )}
      data-slot="tabs-list"
      {...props}
    >
      {children}
      <TabIndicator />
    </BaseTabs.List>
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      className={cn(
        "z-[1] flex-1 items-center justify-center gap-1.5 whitespace-nowrap text-nowrap rounded-md px-2 py-1 text-muted-foreground text-sm [&_svg:not([class*='size-'])] focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[disabled]:pointer-events-none data-selected:text-foreground data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot="tabs-trigger"
      {...props}
    />
  );
}

function TabIndicator({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Indicator>) {
  const { variant } = useTabs();

  return (
    <BaseTabs.Indicator
      className={cn(
        '-translate-y-1/2 absolute left-0 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] transition-all duration-300 ease-in-out',
        variant === 'underline'
          ? 'top-full z-10 h-px bg-primary'
          : '-z-[1] top-1/2 h-[var(--active-tab-height)] rounded-md border bg-input shadow-sm',
        className
      )}
      data-slot="tab-indicator"
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Panel>) {
  return (
    <BaseTabs.Panel
      className={cn('flex-1 outline-none', className)}
      data-slot="tabs-content"
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
