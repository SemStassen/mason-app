import type { User } from "@mason/db/schema";
import {
  AvatarFallback,
  AvatarImage,
  Avatar as AvatarRoot,
} from "@mason/ui/avatar";
import { Icons } from "@mason/ui/icons";
import { cn } from "@mason/ui/utils";

function Avatar({ user }: { user: User | null }) {
  return (
    <AvatarRoot className={cn(!user && "border border-dashed")}>
      <AvatarImage />
      <AvatarFallback>
        {user ? user.display_name.slice(0, 2) : <Icons.User />}
      </AvatarFallback>
    </AvatarRoot>
  );
}

export { Avatar };
