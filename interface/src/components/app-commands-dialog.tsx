import type { Dialog } from "@base-ui-components/react";
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

type BaseCommandItem = {
  title: string;
  value: string;
  hotkey?: string;
  category: CommandCategory;
  disabled?: boolean;
  icon?: React.ReactNode;
};

export type ICommandItem =
  | (BaseCommandItem & {
      subCommands: () => Array<ICommandItem>;
      onSelect?: (dialog: { close: () => void }) => void;
    })
  | (BaseCommandItem & {
      onSelect: (dialog: { close: () => void }) => void;
      subCommands?: never;
    });

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
      useHotkeys(cmd.hotkey, () => cmd.onSelect?.({ close: () => {} }), {
        preventDefault: true,
      });
    }
  }
}

const CATEGORY_ORDER: Array<CommandCategory> = [
  "navigation",
  "settings",
  "developer",
];

function AppCommandsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { getCommands } = useAppCommands();
  const [stack, setStack] = useState<
    Array<{ title: string; commands: Array<ICommandItem> }>
  >([]);

  useHotkeys("meta+j", () => setIsOpen(true), { preventDefault: true });

  const allCommands = getCommands();

  const currentCommands = stack.at(-1)?.commands ?? allCommands;

  const groupedCommands = useMemo(() => {
    const filtered = currentCommands.filter((cmd) => !cmd.disabled);
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
  }, [currentCommands]);

  function getChildren(cmd: ICommandItem) {
    const children = cmd.subCommands?.();
    return children;
  }

  function handleOpenChange(open: boolean, e?: Dialog.Root.ChangeEventDetails) {
    if (e?.reason === "escape-key" && stack.length > 0) {
      setStack((prev) => prev.slice(0, -1));
      return;
    }

    setIsOpen(open);
    if (!open) {
      setStack([]);
    }
  }

  return (
    <CommandDialog onOpenChange={handleOpenChange} open={isOpen}>
      <CommandInput
        placeholder={
          stack.length > 0 ? stack.at(-1)?.title : "Search for a command..."
        }
      />
      <CommandList>
        <CommandEmpty>No command found.</CommandEmpty>
        {groupedCommands.map(({ category, commands: categoryCommands }) => (
          <CommandGroup heading={category} key={category}>
            {categoryCommands.map((cmd) => (
              <CommandItem
                key={cmd.value}
                onSelect={() => {
                  const children = getChildren(cmd);
                  if (children) {
                    setStack((prev) => [
                      ...prev,
                      { title: cmd.title, commands: children },
                    ]);
                    return;
                  }
                  cmd.onSelect?.({ close: () => handleOpenChange(false) });
                }}
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
