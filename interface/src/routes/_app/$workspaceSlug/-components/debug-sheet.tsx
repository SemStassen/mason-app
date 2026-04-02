import { useAtom } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
import { Separator } from "@recount/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@recount/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@recount/ui/tabs";
import { useRouteContext } from "@tanstack/react-router";
import {
  addDays,
  addHours,
  addMinutes,
  subDays,
  subHours,
  subMinutes,
} from "date-fns";
import { Atom } from "effect/unstable/reactivity";

import { currentTimeAtom } from "~/atoms/current-time.atom";
import { PLATFORM } from "~/lib/utils/constants";

export const isDebugSheetOpenAtom = Atom.make(false);

function DebugSheet() {
  const [isOpen, setIsOpen] = useAtom(isDebugSheetOpenAtom);
  const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);
  const { workspace } = useRouteContext({ from: "/_app/$workspaceSlug" });

  const toggleDebugSheet = () => setIsOpen((o) => !o);

  return (
    <Sheet onOpenChange={toggleDebugSheet} open={isOpen}>
      <SheetContent side="right">
        <SheetHeader className="flex flex-row items-center gap-2">
          <Icons.LookingGlass />
          <SheetTitle>Recount Inspector</SheetTitle>
        </SheetHeader>
        <Tabs className="h-full p-2">
          <TabsList className="w-full">
            <TabsTrigger value="llm">LLM</TabsTrigger>
            <TabsTrigger value="recount">Recount</TabsTrigger>
          </TabsList>
          <TabsContent value="llm">Not implemented yet</TabsContent>
          <TabsContent className="space-y-4" value="recount">
            <ul>
              <li>Platform: {PLATFORM.platform}</li>
              <li>Workspace: {workspace.name}</li>
            </ul>
            <Separator />
            <div className="flex flex-row gap-2">
              <Button
                className="grow"
                onClick={() => setCurrentTime(addMinutes(currentTime, 1))}
                variant="outline"
              >
                <Icons.Plus /> 1 minute
              </Button>
              <Button
                className="grow"
                onClick={() => setCurrentTime(addHours(currentTime, 1))}
                variant="outline"
              >
                <Icons.Plus /> 1 hour
              </Button>
              <Button
                className="grow"
                onClick={() => setCurrentTime(addDays(currentTime, 1))}
                variant="outline"
              >
                <Icons.Plus /> 1 day
              </Button>
            </div>
            <div className="flex flex-row gap-2">
              <Button
                className="grow"
                onClick={() => setCurrentTime(subMinutes(currentTime, 1))}
                variant="outline"
              >
                <Icons.Minus /> 1 minute
              </Button>
              <Button
                className="grow"
                onClick={() => setCurrentTime(subHours(currentTime, 1))}
                variant="outline"
              >
                <Icons.Minus /> 1 hour
              </Button>
              <Button
                className="grow"
                onClick={() => setCurrentTime(subDays(currentTime, 1))}
                variant="outline"
              >
                <Icons.Minus /> 1 day
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

export { DebugSheet };
