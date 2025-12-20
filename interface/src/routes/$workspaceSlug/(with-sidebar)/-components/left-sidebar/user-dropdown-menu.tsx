import { Avatar, AvatarFallback, AvatarImage } from "@mason/ui/avatar";
import { Button } from "@mason/ui/button";
import { Icons } from "@mason/ui/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@mason/ui/menu";
import { Link, useRouteContext } from "@tanstack/react-router";
import { Effect } from "effect";
import { MasonClient } from "~/client";

function UserDropdownMenu() {
  const { user } = useRouteContext({
    from: "/$workspaceSlug",
  });

  const handleSignOut = async () => {
    await Effect.runPromise(
      MasonClient.Auth.SignOut().pipe(
        Effect.catchAll(() => Effect.succeed(null))
      )
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="h-fit w-full py-4" variant="ghost">
            <Avatar rounded="lg">
              <AvatarImage />
              <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-start">
              <div className="truncate text-sm">{user.displayName}</div>
              <div className="truncate font-normal text-xs">{user.email}</div>
            </div>
            <Icons.ChevronUpDown />
          </Button>
        }
      />
      <DropdownMenuContent align="start" side="right">
        <DropdownMenuGroup>
          <DropdownMenuItem
            render={
              <Link
                from="/$workspaceSlug"
                to="/$workspaceSlug/settings/profile"
              />
            }
          >
            <Icons.User />
            Profile settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            nativeButton={true}
            render={<button onClick={handleSignOut} type="button" />}
          >
            <Icons.SignOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { UserDropdownMenu };
