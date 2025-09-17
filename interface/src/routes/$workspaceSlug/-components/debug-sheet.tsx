import { useAtomRef } from "@effect-atom/atom-react";
import { Repl } from "@electric-sql/pglite-repl";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@mason/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@mason/ui/tabs";
import { debugSheetAtom } from "~/atoms/ui-atoms";
import { usePGlite } from "~/core/db";
import { PLATFORM } from "~/utils/constants";

function DebugSheet() {
  const db = usePGlite();
  const { isOpen } = useAtomRef(debugSheetAtom);

  return (
    <Sheet
      onOpenChange={(open) =>
        debugSheetAtom.update(() => ({
          isOpen: open,
        }))
      }
      open={isOpen}
    >
      <SheetContent side="right">
        <SheetHeader>
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
          <TabsContent value="mason">
            <ul>
              <li>Platform: {PLATFORM.platform}</li>
            </ul>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

export { DebugSheet };
