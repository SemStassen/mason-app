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
  leadId: Project["lead_id"];
  onChange: (leadId: Project["lead_id"]) => void;
}

function UpdateLeadCombobox({
  users,
  leadId,
  onChange,
}: UpdateLeadComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const handleSelect = (id: Project["lead_id"]) => {
    onChange(id);
    setIsOpen(false);
  };

  const leadUser = users.find(({ id }) => id === leadId);

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
                isSelected={!leadId}
              >
                Unassigned
              </CommandItem>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.display_name}
                  onSelect={() => handleSelect(user.id)}
                  isSelected={leadId === user.id}
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
