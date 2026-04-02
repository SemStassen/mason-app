import { Avatar, AvatarFallback, AvatarImage } from "@recount/ui/avatar";
import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
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
} from "@recount/ui/menu";
import { Link, useRouter } from "@tanstack/react-router";

import { Route as WorkspaceRoute } from "~/routes/_app/$workspaceSlug/route";

function WorkspaceDropdownMenu() {
  const router = useRouter();
  const { workspace, workspaces } = WorkspaceRoute.useRouteContext();

  // const handleSetActiveWorkspace = async (workspaceId: string) => {
  //   await Effect.runPromise(
  //     Effect.gen(function* () {
  //       yield* RecountClient.Workspace.SetActive({
  //         payload: {
  //           workspaceId: workspaceId,
  //         },
  //       });

  //       router.invalidate();
  //     }).pipe(Effect.catchAll(() => Effect.succeed(null)))
  //   );
  // };

  const handleSetActiveWorkspace = async (workspaceId: string) => {};

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="max-w-full" size="sm" variant="ghost">
            <Avatar>
              <AvatarImage />
              <AvatarFallback>{workspace.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="truncate">{workspace.name}</span>
            <Icons.ChevronDown />
          </Button>
        }
      />
      <DropdownMenuContent align="start" side="bottom">
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Switch workspace</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={workspace.id}>
                {workspaces.map((w) => (
                  <DropdownMenuRadioItem
                    key={w.id}
                    onClick={() => handleSetActiveWorkspace(w.id)}
                    value={w.id}
                  >
                    {w.name}
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
