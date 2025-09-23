import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@mason/ui/command";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Hotkey } from "./hotkey";

export type CommandCategory = "navigation" | "settings" | "developer";

export type ICommandItem = {
  title: string;
  value: string;
  hotkey?: string;
  category: CommandCategory;
  onSelect: (dialog: { close: () => void }) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
};

type Context = {
  register: (cb: () => Array<ICommandItem>) => () => void;
  getCommands: () => Array<ICommandItem>;
};

const AppCommandsContext = createContext<Context | undefined>(undefined);

function AppCommandsProvider({ children }: { children: React.ReactNode }) {
  const callbacksRef = useRef<Array<() => Array<ICommandItem>>>([]);

  const register = (cb: () => Array<ICommandItem>) => {
    callbacksRef.current.push(cb);

    return () => {
      callbacksRef.current = callbacksRef.current.filter((c) => c !== cb);
    };
  };

  const getCommands = () => callbacksRef.current.flatMap((cb) => cb());

  return (
    <AppCommandsContext.Provider value={{ register, getCommands }}>
      {children}
    </AppCommandsContext.Provider>
  );
}

function useAppCommands() {
  const value = useContext(AppCommandsContext);
  if (!value) {
    throw new Error("useAppCommands must be used within AppCommandsProvider");
  }
  return value;
}

function useRegisterCommands(cb: () => Array<ICommandItem>) {
  const { register } = useAppCommands();
  const commands = cb();

  useEffect(() => register(() => commands), [register, commands]);

  for (const cmd of commands) {
    if (cmd.hotkey) {
      // biome-ignore lint/suspicious/noEmptyBlockStatements: This is needed to mock the close function
      // biome-ignore lint/correctness/useHookAtTopLevel: This is fine since the order should stay the same
      useHotkeys(cmd.hotkey, () => cmd.onSelect({ close: () => {} }), {
        preventDefault: true,
      });
    }
  }
}

const CATEGORY_ORDER: CommandCategory[] = [
  "navigation",
  "settings",
  "developer",
];

function AppCommandsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { getCommands } = useAppCommands();

  useHotkeys("meta+j", () => setIsOpen(true), { preventDefault: true });

  const commands = getCommands();

  const groupedCommands = useMemo(() => {
    const filtered = commands.filter((cmd) => !cmd.disabled);
    const grouped = filtered.reduce(
      (acc, cmd) => {
        if (!acc[cmd.category]) {
          acc[cmd.category] = [];
        }
        acc[cmd.category].push(cmd);
        return acc;
      },
      {} as Record<CommandCategory, Array<ICommandItem>>
    );

    // Sort categories by the defined order
    const orderedCategories = CATEGORY_ORDER.filter(
      (category) => grouped[category]?.length > 0
    );
    return orderedCategories.map((category) => ({
      category,
      commands: grouped[category],
    }));
  }, [commands]);

  return (
    <CommandDialog onOpenChange={setIsOpen} open={isOpen}>
      <CommandInput placeholder="Search for a command..." />
      <CommandList>
        <CommandEmpty>No command found.</CommandEmpty>
        {groupedCommands.map(({ category, commands: categoryCommands }) => (
          <CommandGroup heading={category} key={category}>
            {categoryCommands.map((cmd) => (
              <CommandItem
                key={cmd.value}
                onSelect={() => cmd.onSelect({ close: () => setIsOpen(false) })}
              >
                {cmd.icon}
                <span>{cmd.title}</span>
                {cmd.hotkey && (
                  <CommandShortcut>
                    <Hotkey>{cmd.hotkey}</Hotkey>
                  </CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

export { AppCommandsProvider, useRegisterCommands, AppCommandsDialog };
