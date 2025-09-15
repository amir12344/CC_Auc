"use client";

import { useMemo, useState } from "react";

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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Info,
  LayoutGrid,
  Loader2,
  Search,
} from "lucide-react";

import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardHeader } from "@/src/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { useToastNotification } from "@/src/hooks/useToastNotification";

import {
  fileToDbCategoryBiMap,
  fileToDbConditionBiMap,
  fileToDbSubcategoryBiMap,
} from "../../../../amplify/functions/commons/converters/ListingTypeConverter";
import type { ManifestItem } from "../types";
import { exportManifestToCsv } from "../utils/csvExport";
import {
  CategoryTab,
  GIDescriptionTab,
  ProductClassTab,
  SubcategoryTab,
} from "./tabs";

interface ManifestTableProps {
  /** Auction manifest data from API */
  manifestData: ManifestItem[];
  retailPrice: number;
}

// Define columns for ManifestItem data - in same order as query
const columns: ColumnDef<ManifestItem>[] = [
  {
    accessorKey: "title",
    header: "Product Name",
    cell: ({ row }) => (
      <div className="text-md font-medium text-slate-700">
        {row.original.title}
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate text-sm text-slate-900">
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: "retail_price",
    header: () => <div className="text-right">Retail Price</div>,
    cell: ({ row }) => {
      const price =
        Number.parseFloat(row.original.retail_price.replace(/[$,]/g, "")) || 0;
      return (
        <div className="text-right text-sm font-medium text-slate-900">
          ${price.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "ext_retail",
    header: () => <div className="text-right">Ext. Retail</div>,
    cell: ({ row }) => {
      const price =
        Number.parseFloat(
          row.original.ext_retail?.replace(/[$,]/g, "") || "0"
        ) || 0;
      return (
        <div className="text-right text-sm font-medium text-slate-900">
          ${price.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-slate-600">
        {row.original.sku}
      </span>
    ),
  },
  {
    accessorKey: "available_quantity",
    header: () => <div className="text-center">Qty</div>,
    cell: ({ row }) => (
      <div className="text-center text-sm font-medium text-slate-900">
        {row.original.available_quantity}
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge
        className="border-gray-200 bg-gray-50 text-gray-700"
        variant="outline"
      >
        {row.original.category
          ? fileToDbCategoryBiMap.getKey(row.original.category as never)
          : "Not specified"}
      </Badge>
    ),
  },
  {
    accessorKey: "subcategory",
    header: "Subcategory",
    cell: ({ row }) => (
      <Badge
        className="border-gray-200 bg-gray-50 text-gray-700"
        variant="outline"
      >
        {row.original.subcategory
          ? fileToDbSubcategoryBiMap.getKey(row.original.subcategory as never)
          : "Not specified"}
      </Badge>
    ),
  },
  {
    accessorKey: "product_condition",
    header: "Product Condition",
    cell: ({ row }) => (
      <Badge
        className={`text-xs ${
          row.original.product_condition?.toLowerCase() === "new"
            ? "border-gray-200 bg-gray-50 text-gray-700"
            : "border-gray-200 bg-gray-50 text-gray-700"
        }`}
        variant="outline"
      >
        {row.original.product_condition
          ? fileToDbConditionBiMap.getKey(
              row.original.product_condition as never
            )
          : "Not specified"}
      </Badge>
    ),
  },
  {
    accessorKey: "cosmetic_condition",
    header: "Cosmetic Condition",
    cell: ({ row }) => (
      <span className="text-sm text-slate-600">
        {row.original.cosmetic_condition}
      </span>
    ),
  },
  {
    accessorKey: "identifier",
    header: "Identifier",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-slate-600">
        {row.original.identifier}
      </span>
    ),
  },
  {
    accessorKey: "identifier_type",
    header: "ID Type",
    cell: ({ row }) => (
      <Badge
        className="border-gray-200 bg-gray-50 text-xs text-gray-700"
        variant="outline"
      >
        {row.original.identifier_type}
      </Badge>
    ),
  },
  {
    accessorKey: "is_hazmat",
    header: () => <div className="text-center">Hazmat</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.is_hazmat ? (
          <Badge
            className="border-red-200 bg-red-50 text-xs text-red-700"
            variant="outline"
          >
            Yes
          </Badge>
        ) : (
          <Badge
            className="border-gray-200 bg-gray-50 text-xs text-gray-700"
            variant="outline"
          >
            No
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "model_name",
    header: "Model Name",
    cell: ({ row }) => (
      <span className="text-sm text-slate-900">{row.original.model_name}</span>
    ),
  },
];

const tabOptions = [
  { value: "full", label: "Full Manifest" },
  { value: "product-class", label: "Product Class" },
  { value: "category", label: "Category" },
  { value: "subcategory", label: "Subcategory" },
  { value: "marketplace-data", label: "Marketplace Data" },
];

export function ManifestTable({
  manifestData,
  retailPrice,
}: ManifestTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [activeTab, setActiveTab] = useState("full");
  const [isDownloading, setIsDownloading] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Toast notifications
  const toast = useToastNotification();

  // Calculate total extended retail value
  const totalExtRetailValue = useMemo(() => {
    return manifestData.reduce((sum, row) => {
      const extRetail =
        Number.parseFloat(row.ext_retail?.replace(/[$,]/g, "") || "0") || 0;
      return sum + extRetail;
    }, 0);
  }, [manifestData]);

  // Handle CSV download
  const handleDownloadManifest = () => {
    if (isDownloading) {
      return;
    }

    setIsDownloading(true);

    // Show loading toast
    toast.info("Preparing manifest download...");

    // Use setTimeout to prevent blocking the UI during CSV generation
    setTimeout(() => {
      try {
        exportManifestToCsv(manifestData, "Auction Manifest");

        // Show success toast
        toast.success(
          `Manifest downloaded successfully! ${manifestData.length} items exported to CSV.`
        );
      } catch {
        // Show error toast
        toast.error(
          "Failed to download manifest. Please try again or contact support if the issue persists."
        );
      } finally {
        setIsDownloading(false);
      }
    }, 100); // Small delay to allow UI to update
  };

  const table = useReactTable({
    data: manifestData,
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

  return (
    <div className="bg-gray-50">
      <div className="max-w-8xl mx-auto space-y-4 p-4 md:space-y-6 md:p-6">
        {/* Header */}
        <Card className="rounded-lg !p-0 shadow-sm">
          <CardHeader className="bg-slate-900 p-4 text-white md:p-6">
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
              <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                MANIFEST
              </h1>
              <div className="text-xs text-slate-300 md:text-sm">
                {manifestData.length} items • ${retailPrice.toLocaleString()}{" "}
                total ext. retail value
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Alert */}
        <Alert className="border-slate-200 bg-slate-50">
          <Info className="h-4 w-4 flex-shrink-0 text-slate-600" />
          <AlertDescription className="text-sm text-slate-700">
            Product manifest from auction listing. Individual items and
            quantities may vary.
          </AlertDescription>
        </Alert>

        {/* Tabs Container */}
        <Tabs
          className="w-full flex-col justify-start gap-6"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          {/* Tab Navigation and Controls */}
          <div className="space-y-3 px-0">
            {/* Tab Navigation Row */}
            <div className="flex items-center justify-between gap-2">
              {/* Mobile Tab Selector */}
              <div className="block md:hidden">
                <Label className="sr-only" htmlFor="view-selector">
                  View
                </Label>
                <Select onValueChange={setActiveTab} value={activeTab}>
                  <SelectTrigger
                    className="flex w-fit"
                    id="view-selector"
                    size="sm"
                  >
                    <SelectValue placeholder="Select a view" />
                  </SelectTrigger>
                  <SelectContent>
                    {tabOptions.map((tab) => (
                      <SelectItem key={tab.value} value={tab.value}>
                        {tab.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop Tab Navigation */}
              <TabsList className="hidden md:flex">
                {tabOptions.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Download Manifest Button */}
              <Button
                className="bg-slate-900 text-white shadow-sm hover:bg-slate-800"
                disabled={isDownloading}
                onClick={handleDownloadManifest}
                size="sm"
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {isDownloading ? "Downloading..." : "Download Manifest"}
              </Button>
            </div>
          </div>

          {/* Tab Content */}
          <TabsContent
            className="relative flex flex-col gap-4 overflow-auto px-0 px-4"
            value="full"
          >
            {/* Search Controls */}
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-3">
              <span className="text-sm font-medium text-slate-700">
                Filter:
              </span>
              <div className="relative flex-1 md:max-w-md">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="border-slate-200 pl-10 focus:border-slate-400 focus:ring-slate-400"
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Search manifest items..."
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

              {/* Custom Columns */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">View</span>
                    <span className="md:hidden">View</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      // Map column IDs to proper display names
                      const getColumnDisplayName = (
                        columnId: string
                      ): string => {
                        const columnNameMap: Record<string, string> = {
                          title: "Product Name",
                          description: "Description",
                          retail_price: "Retail Price",
                          ext_retail: "Ext. Retail",
                          sku: "SKU",
                          available_quantity: "Qty",
                          category: "Category",
                          subcategory: "Subcategory",
                          product_condition: "Product Condition",
                          cosmetic_condition: "Cosmetic Condition",
                          identifier: "Identifier",
                          identifier_type: "ID Type",
                          is_hazmat: "Hazmat",
                          model_name: "Model Name",
                        };
                        return columnNameMap[columnId] || columnId;
                      };

                      return (
                        <DropdownMenuCheckboxItem
                          checked={column.getIsVisible()}
                          className="capitalize"
                          key={column.id}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {getColumnDisplayName(column.id)}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Data Table with Horizontal Scroll */}
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
                            No manifest items found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Scroll hint for mobile */}
              <div className="text-muted-foreground mt-2 text-center text-xs md:hidden">
                ← Scroll horizontally to view all columns →
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
                  <Label
                    className="text-sm font-medium"
                    htmlFor="rows-per-page"
                  >
                    Rows per page
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      table.setPageSize(Number(value));
                    }}
                    value={`${table.getState().pagination.pageSize}`}
                  >
                    <SelectTrigger
                      className="w-20"
                      id="rows-per-page"
                      size="sm"
                    >
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
                  {manifestData
                    .reduce(
                      (sum, item) =>
                        sum + (Number(item.available_quantity) || 0),
                      0
                    )
                    .toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">
                  <span className="font-medium">Total Ext. Retail Value:</span>{" "}
                  <span className="font-bold text-slate-900">
                    ${retailPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Other Tab Contents */}
          <TabsContent value="product-class">
            <ProductClassTab manifestData={manifestData} />
          </TabsContent>

          <TabsContent value="category">
            <CategoryTab manifestData={manifestData} />
          </TabsContent>

          <TabsContent value="subcategory">
            <SubcategoryTab manifestData={manifestData} />
          </TabsContent>

          <TabsContent value="marketplace-data">
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <LayoutGrid className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Marketplace Data
                </h3>
                <p className="text-gray-500">Data coming soon</p>
                <div className="mt-4 text-sm text-gray-400">
                  We&apos;re preparing comprehensive marketplace insights for
                  you
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
