import { useAtomValue } from "@effect-atom/atom-react";
import { Icons } from "@mason/ui/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@mason/ui/table";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef } from "react";
import { projectsWithTasksAtom } from "~/atoms/api";
import type { Project } from "~/types";

function ProjectsTable({
  onSelectProject,
}: {
  onSelectProject: (projectId: string) => void;
}) {
  const projectsWithTasks = useAtomValue(projectsWithTasksAtom);

  const columns = useMemo<Array<ColumnDef<Project>>>(
    () => [
      {
        accessorKey: "hexColor",
        header: "",
        cell: (info) => (
          <div
            className="size-4 rounded-sm"
            style={{ backgroundColor: `${info.getValue()}` }}
          />
        ),
        size: 32,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: (info) => info.getValue(),
        meta: { className: "flex-1" },
      },
      {
        accessorKey: "isBillable",
        header: "Billable",
        cell: (info) => (info.getValue() ? "Yes" : "No"),
        size: 80,
      },
      {
        accessorKey: "_metadata",
        header: "Source",
        cell: (info) =>
          info.getValue()?.source === "float" ? (
            <Icons.Company.Float size={24} />
          ) : (
            ""
          ),
        size: 80,
      },
    ],
    []
  );

  const table = useReactTable({
    data: projectsWithTasks,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 34,
    overscan: 10,
  });

  return projectsWithTasks.length > 0 ? (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                className={header.column.columnDef.meta?.className}
                key={header.id}
                style={{ width: header.getSize() }}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody ref={parentRef}>
        {virtualizer.getVirtualItems().map((virtualRow, index) => {
          const row = rows[virtualRow.index];
          return (
            <TableRow
              key={row.id}
              render={
                <button
                  onClick={() => onSelectProject(row.original.id)}
                  type="button"
                />
              }
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${
                  virtualRow.start - index * virtualRow.size
                }px)`,
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  className={cell.column.columnDef.meta?.className}
                  key={cell.id}
                  style={{ width: cell.column.getSize() }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  ) : (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Icons.Folder size={36} />
        No projects found
      </div>
    </div>
  );
}

export { ProjectsTable };
