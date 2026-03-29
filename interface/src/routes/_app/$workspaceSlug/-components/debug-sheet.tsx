import { useAtom } from "@effect/atom-react";
import { Button } from "@mason/ui/button";
import { Icons } from "@mason/ui/icons";
import { Separator } from "@mason/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@mason/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@mason/ui/tabs";
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

  const toggleDebugSheet = () => setIsOpen((o) => !o);

  return (
    <Sheet onOpenChange={toggleDebugSheet} open={isOpen}>
      <SheetContent side="right">
        <SheetHeader className="flex flex-row items-center gap-2">
          <Icons.LookingGlass />
          <SheetTitle>Mason Inspector</SheetTitle>
        </SheetHeader>
        <Tabs className="h-full p-2">
          <TabsList className="w-full">
            <TabsTrigger value="llm">LLM</TabsTrigger>
            <TabsTrigger value="mason">Mason</TabsTrigger>
          </TabsList>
          <TabsContent value="llm">Not implemented yet</TabsContent>
          <TabsContent className="space-y-4" value="mason">
            <ul>
              <li>Platform: {PLATFORM.platform}</li>
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
