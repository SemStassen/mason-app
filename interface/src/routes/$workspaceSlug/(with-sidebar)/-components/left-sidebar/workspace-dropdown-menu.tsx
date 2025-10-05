import { Avatar, AvatarFallback, AvatarImage } from "@mason/ui/avatar";
import { Button } from "@mason/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@mason/ui/dropdown-menu";
import { Icons } from "@mason/ui/icons";
import { Link, useRouteContext, useRouter } from "@tanstack/react-router";
import { Effect } from "effect";
import { MasonClient } from "~/client";

function WorkspaceDropdownMenu() {
  const router = useRouter();
  const { user } = useRouteContext({
    from: "/$workspaceSlug",
  });

  const handleSetActiveWorkspace = async (workspaceId: string) => {
    await Effect.runPromise(
      Effect.gen(function* () {
        yield* MasonClient.Workspace.SetActive({
          payload: {
            workspaceId: workspaceId,
          },
        });

        router.invalidate();
      }).pipe(Effect.catchAll(() => Effect.succeed(null)))
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="max-w-full" size="sm" variant="ghost">
            <Avatar rounded="lg" size="sm">
              <AvatarImage />
              <AvatarFallback>
                {user.activeWorkspace?.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{user.activeWorkspace?.name}</span>
            <Icons.ChevronDown />
          </Button>
        }
      />
      <DropdownMenuContent align="start" side="bottom">
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Switch workspace</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={user.activeWorkspace.id}>
                {user.memberships.map(({ workspace }) => (
                  <DropdownMenuRadioItem
                    key={workspace.id}
                    onClick={() => handleSetActiveWorkspace(workspace.id)}
                    value={workspace.id}
                  >
                    {workspace.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem render={<Link to="/create-workspace" />}>
                  <Icons.Plus />
                  Create a new workspace
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { WorkspaceDropdownMenu };
