"use client";

import { useState } from "react";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

import {
  calculateTotals,
  formatCurrency,
  type AggregatedManifestData,
} from "../../utils/manifestAggregation";

interface AggregatedDataTableProps {
  /** Aggregated data to display */
  data: AggregatedManifestData[];
  /** Column header for the main grouping field */
  groupColumnHeader: string;
  /** Optional search placeholder text */
  searchPlaceholder?: string;
}

/**
 * Reusable table component for displaying aggregated manifest data
 * Provides consistent styling and functionality across all manifest tabs
 */
export const AggregatedDataTable = ({
  data,
  groupColumnHeader,
  searchPlaceholder = "Search items...",
}: AggregatedDataTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Define columns for aggregated data
  const columns: ColumnDef<AggregatedManifestData>[] = [
    {
      accessorKey: "label",
      header: groupColumnHeader,
      cell: ({ row }) => (
        <div className="text-sm font-medium text-slate-900">
          {row.original.label}
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-right">Qty</div>,
      cell: ({ row }) => (
        <div className="text-right text-sm font-medium text-slate-900">
          {row.original.quantity.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "extRetail",
      header: () => <div className="text-right">Ext. Retail</div>,
      cell: ({ row }) => (
        <div className="text-right text-sm font-medium text-slate-900">
          {formatCurrency(row.original.extRetail)}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination,
    },
    enableRowSelection: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
  });

  // Calculate totals
  const totals = calculateTotals(data);

  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-3">
        <span className="text-sm font-medium text-slate-700">Filter:</span>
        <div className="relative flex-1 md:max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="border-slate-200 pl-10 focus:border-slate-400 focus:ring-slate-400"
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            value={globalFilter}
          />
        </div>
        {globalFilter && (
          <Badge
            className="border-slate-200 bg-slate-100 text-slate-700"
            variant="secondary"
          >
            {table.getFilteredRowModel().rows.length} results
          </Badge>
        )}
      </div>

      {/* Data Table */}
      <div className="w-full">
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="min-w-full">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-slate-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        className="sticky top-0 z-10 bg-slate-50 px-4 py-3 text-left font-medium whitespace-nowrap text-slate-900"
                        colSpan={header.colSpan}
                        key={header.id}
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
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      className="hover:bg-slate-50"
                      data-state={row.getIsSelected() && "selected"}
                      key={row.id}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          key={cell.id}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      className="h-24 text-center"
                      colSpan={columns.length}
                    >
                      No items found.
                    </TableCell>
                  </TableRow>
                )}
                {/* Totals Row */}
                <TableRow className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
                  <TableCell className="px-4 py-3 text-sm font-bold text-slate-900">
                    Total
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                    {totals.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                    {formatCurrency(totals.extRetail)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          Showing{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}{" "}
          to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} entries
        </div>
        <div className="flex w-full items-center gap-4 lg:w-fit lg:gap-8">
          <div className="hidden items-center gap-2 lg:flex">
            <Label className="text-sm font-medium" htmlFor="rows-per-page">
              Rows per page
            </Label>
            <Select
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
              value={`${table.getState().pagination.pageSize}`}
            >
              <SelectTrigger className="w-20" id="rows-per-page" size="sm">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              className="hidden h-8 w-8 p-0 lg:flex"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.setPageIndex(0)}
              variant="outline"
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              className="h-8 w-8 p-0"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              variant="outline"
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              className="h-8 w-8 p-0"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              variant="outline"
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              className="hidden h-8 w-8 p-0 lg:flex"
              disabled={!table.getCanNextPage()}
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              variant="outline"
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="text-sm text-slate-600">
            <span className="font-medium">Total Items:</span>{" "}
            {totals.quantity.toLocaleString()}
          </div>
          <div className="text-sm text-slate-600">
            <span className="font-medium">Total Retail Value:</span>{" "}
            <span className="font-bold text-slate-900">
              {formatCurrency(totals.extRetail)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
