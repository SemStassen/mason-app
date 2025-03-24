import { usePGlite } from "@mason/db/db";
import { Repl } from "@mason/db/repl";
import { Button } from "@mason/ui/button";
import { Icons } from "@mason/ui/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mason/ui/select";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@mason/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@mason/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@mason/ui/tabs";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useLiveIncrementalQuery } from "~/hooks/use-live-query";
import { rootStore } from "~/stores/root-store";

const TABLES = [
  {
    name: "Workspaces",
    value: "workspaces",
  },
  {
    name: "Users",
    value: "users",
  },
  {
    name: "Projects",
    value: "projects",
  },
  {
    name: "Activities",
    value: "activities",
  },
  {
    name: "Time Entries",
    value: "time_entries",
  },
];

function renderField(field: unknown) {
  if (field instanceof Date) return field.toLocaleString();
  return field as React.ReactNode;
}

function TableTabsContent() {
  const [selectedTable, setSelectedTable] = useState<string>(TABLES[0].value);

  const tableData = useLiveIncrementalQuery(
    `SELECT * FROM ${selectedTable}`,
    [],
    "uuid",
  );

  return (
    <>
      <Select value={selectedTable} onValueChange={setSelectedTable}>
        <SelectTrigger>
          <SelectValue placeholder="Table" />
        </SelectTrigger>
        <SelectContent>
          {TABLES.map((table) => {
            return (
              <SelectItem key={table.value} value={table.value}>
                {table.name}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {tableData && (
        <Table className="overflow-y-scroll">
          <TableHeader>
            <TableRow>
              {tableData.fields.map((field) => (
                <TableHead key={field.name}>{field.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.rows.map((row, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Index as key
              <TableRow key={index}>
                {tableData.fields.map((field) => (
                  // @ts-ignore: Dynamic field access
                  <TableCell key={field.name}>
                    {renderField(row[field.name])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}

const Inspector = observer(() => {
  const { uiStore } = rootStore;

  const pg = usePGlite();

  return (
    <Sheet modal={false} open={uiStore.isInspectorOpen}>
      <SheetContent className="flex flex-col overflow-hidden">
        <SheetClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-6 right-6"
            onClick={() => uiStore.toggleInspector()}
          >
            <Icons.X />
          </Button>
        </SheetClose>
        <SheetTitle>Inspector</SheetTitle>
        <Tabs
          defaultValue="repl"
          className="flex flex-1 flex-col overflow-hidden"
        >
          <TabsList>
            <TabsTrigger value="repl">REPL</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
          </TabsList>
          <TabsContent value="repl" className="overflow-y-scroll">
            <Repl pg={pg} />
          </TabsContent>
          <TabsContent value="tables" className="flex flex-col overflow-hidden">
            <TableTabsContent />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
});

export { Inspector };
