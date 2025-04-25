import type { Project, User } from "@mason/db/schema";
import { Button } from "@mason/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@mason/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@mason/ui/popover";
import { useState } from "react";

interface UpdateLeadComboboxProps {
  users: User[];
  leadUuid: Project["lead_uuid"];
  onChange: (leadUuid: Project["lead_uuid"]) => void;
}

function UpdateLeadCombobox({
  users,
  leadUuid,
  onChange,
}: UpdateLeadComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const handleSelect = (uuid: Project["lead_uuid"]) => {
    onChange(uuid);
    setIsOpen(false);
  };

  const leadUser = users.find(({ uuid }) => uuid === leadUuid);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          {leadUser ? leadUser.display_name : "Unassigned"}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandInput autoFocus={true} placeholder="Set lead..." />
          <CommandList>
            <CommandEmpty />
            <CommandGroup>
              <CommandItem
                value="unassigned"
                onSelect={() => handleSelect(null)}
                isSelected={!leadUuid}
              >
                Unassigned
              </CommandItem>
              {users.map((user) => (
                <CommandItem
                  key={user.uuid}
                  value={user.display_name}
                  onSelect={() => handleSelect(user.uuid)}
                  isSelected={leadUuid === user.uuid}
                >
                  {user.display_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { UpdateLeadCombobox };
