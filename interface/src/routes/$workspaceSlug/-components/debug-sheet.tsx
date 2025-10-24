import { useAtomRef } from "@effect-atom/atom-react";
import { Repl } from "@electric-sql/pglite-repl";
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
import {
  _setCurrentTime,
  calendarCurrentTimeAtom,
} from "~/atoms/calendar-atom";
import { debugSheetAtom, toggleDebugSheet } from "~/atoms/ui-atoms";
import { useRegisterCommands } from "~/components/app-commands-dialog";
import { usePGlite } from "~/core/db";
import { PLATFORM } from "~/utils/constants";

function DebugSheet() {
  const db = usePGlite();
  const { isOpen } = useAtomRef(debugSheetAtom);
  const currentTime = useAtomRef(calendarCurrentTimeAtom);

  useRegisterCommands(() => [
    {
      title: isOpen ? "Close inspector" : "Open inspector",
      value: isOpen ? "close-inspector" : "open-inspector",
      hotkey: "o>i",
      category: "developer",
      onSelect: (dialog) => {
        toggleDebugSheet();
        dialog.close();
      },
    },
  ]);

  return (
    <Sheet onOpenChange={toggleDebugSheet} open={isOpen}>
      <SheetContent side="right">
        <SheetHeader className="flex flex-row items-center gap-2">
          <Icons.LookingGlass />
          <SheetTitle>Mason Inspector</SheetTitle>
        </SheetHeader>
        <Tabs className="h-full p-2">
          <TabsList className="w-full">
            <TabsTrigger value="sql">SQL</TabsTrigger>
            <TabsTrigger value="llm">LLM</TabsTrigger>
            <TabsTrigger value="mason">Mason</TabsTrigger>
          </TabsList>
          <TabsContent className="h-full" value="sql">
            <Repl pg={db} />
          </TabsContent>
          <TabsContent value="llm">Not implemented yet</TabsContent>
          <TabsContent className="space-y-4" value="mason">
            <ul>
              <li>Platform: {PLATFORM.platform}</li>
            </ul>
            <Separator />
            <div className="flex flex-row gap-2">
              <Button
                className="grow"
                onClick={() => _setCurrentTime(addMinutes(currentTime, 1))}
                variant="outline"
              >
                <Icons.Plus /> 1 minute
              </Button>
              <Button
                className="grow"
                onClick={() => _setCurrentTime(addHours(currentTime, 1))}
                variant="outline"
              >
                <Icons.Plus /> 1 hour
              </Button>
              <Button
                className="grow"
                onClick={() => _setCurrentTime(addDays(currentTime, 1))}
                variant="outline"
              >
                <Icons.Plus /> 1 day
              </Button>
            </div>
            <div className="flex flex-row gap-2">
              <Button
                className="grow"
                onClick={() => _setCurrentTime(subMinutes(currentTime, 1))}
                variant="outline"
              >
                <Icons.Minus /> 1 minute
              </Button>
              <Button
                className="grow"
                onClick={() => _setCurrentTime(subHours(currentTime, 1))}
                variant="outline"
              >
                <Icons.Minus /> 1 hour
              </Button>
              <Button
                className="grow"
                onClick={() => _setCurrentTime(subDays(currentTime, 1))}
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
