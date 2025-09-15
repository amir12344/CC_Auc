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

import { fileToDbConditionBiMap } from "@/amplify/functions/commons/converters/ListingTypeConverter";
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
import { AggregatedDataTable } from "@/src/features/auctions/components/shared/AggregatedDataTable";
import { useToastNotification } from "@/src/hooks/useToastNotification";

import {
  exportLotManifestToCsv,
  type ManifestItem,
} from "../../utils/csvExport";
import {
  aggregateLotByCategory,
  aggregateLotByProductClass,
  aggregateLotBySubcategory,
} from "../../utils/lotManifestAggregation";

/**
 * Enhanced interface for lot listing with additional fields
 */
export interface LotListingAdditionalInfo {
  lot_shipping_type?: string;
  lot_freight_type?: string;
  number_of_pallets?: number;
  pallet_spaces?: number;
  pallet_length?: number;
  pallet_width?: number;
  pallet_height?: number;
  pallet_dimension_type?: string;
  pallet_stackable?: boolean;
  number_of_truckloads?: number;
  number_of_shipments?: number;
  is_refrigerated?: boolean;
  is_fda_registered?: boolean;
  is_hazmat?: boolean;
  resale_requirement?: string;
  accessories?: string;
  inspection_status?: string;
  seller_notes?: string;
  shipping_notes?: string;
  additional_information?: string;
  offer_requirements?: string;
}

/**
 * Format currency utility
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

/**
 * Calculate totals from manifest items
 */
const calculateTotals = (items: ManifestItem[]) => {
  return items.reduce(
    (totals, item) => {
      const quantity = item.available_quantity || 0;
      const retailPrice = item.retail_price || 0;
      const extRetail = quantity * retailPrice;

      return {
        quantity: totals.quantity + quantity,
        extRetail: totals.extRetail + extRetail,
      };
    },
    { quantity: 0, extRetail: 0 }
  );
};

interface LotListingManifestTableProps {
  manifestItems: ManifestItem[];
  lotTitle?: string;
  lotInfo?: LotListingAdditionalInfo;
}

/**
 * LotListingManifestTable Component
 * Redesigned with tabs similar to AuctionManifest and polished styling
 */
export const LotListingManifestTable = ({
  manifestItems,
  lotTitle,
  lotInfo,
}: LotListingManifestTableProps) => {
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

  // Handle CSV download
  const handleDownloadManifest = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      toast.info("Preparing manifest download...");
      await new Promise((r) => setTimeout(r, 100));
      if (!manifestItems || manifestItems.length === 0) {
        throw new Error("No manifest items available to export");
      }
      exportLotManifestToCsv(manifestItems, lotTitle, lotInfo);
      toast.success(
        `Manifest downloaded successfully! ${manifestItems.length} items exported to CSV.`
      );
    } catch (error) {
      console.error("Manifest download error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to download manifest. Please try again or contact support if the issue persists.";
      toast.error(message);
    } finally {
      setIsDownloading(false);
    }
  };

  // Define columns for manifest items
  const columns: ColumnDef<ManifestItem>[] = [
    {
      accessorKey: "title",
      header: "Product",
      cell: ({ row }) => (
        <div className="min-w-[200px]">
          <div
            className="block max-w-[420px] lg:max-w-[560px] truncate text-sm font-medium text-slate-900"
            title={row.original.title || undefined}
          >
            {row.original.title}
          </div>
          {row.original.brand_name && (
            <div className="text-xs text-slate-500">
              {row.original.brand_name}
            </div>
          )}
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <div className="min-w-[100px] font-mono text-sm text-slate-700">
          {row.original.sku}
        </div>
      ),
    },
    {
      accessorKey: "product_condition",
      header: "Condition",
      cell: ({ row }) => {
        const conditionEnum = row.original.product_condition;
        const conditionLabel = conditionEnum
          ? fileToDbConditionBiMap.getKey(conditionEnum as any) || conditionEnum
          : "N/A";
        return <div className="text-sm text-slate-700">{conditionLabel}</div>;
      },
    },
    {
      accessorKey: "available_quantity",
      header: () => <div className="text-right">Qty</div>,
      cell: ({ row }) => (
        <div className="text-right text-sm font-medium text-slate-900">
          {(row.original.available_quantity || 0).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "retail_price",
      header: () => <div className="text-right">Unit Price</div>,
      cell: ({ row }) => (
        <div className="text-right text-sm font-medium text-slate-900">
          {row.original.retail_price
            ? formatCurrency(row.original.retail_price)
            : "N/A"}
        </div>
      ),
    },
    {
      id: "ext_retail",
      header: () => <div className="text-right">Ext. Retail</div>,
      cell: ({ row }) => {
        const quantity = row.original.available_quantity || 0;
        const unitPrice = row.original.retail_price || 0;
        const extRetail = quantity * unitPrice;
        return (
          <div className="text-right text-sm font-medium text-slate-900">
            {extRetail > 0 ? formatCurrency(extRetail) : "N/A"}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: manifestItems,
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
  const totals = calculateTotals(manifestItems);
  const totalExtRetailValue = useMemo(
    () => totals.extRetail,
    [totals.extRetail]
  );

  const tabOptions = [
    { value: "full", label: "Full Manifest" },
    { value: "product-class", label: "Product Class" },
    { value: "category", label: "Category" },
    { value: "subcategory", label: "Subcategory" },
    { value: "marketplace-data", label: "Marketplace Data" },
  ];

  return (
    <div className="bg-gray-50" id="lot-manifest-table">
      <div className="max-w-8xl mx-auto space-y-4 p-4 md:space-y-6 md:p-6">
        {/* Header - clean, minimal, neutral */}
        <Card className="rounded-xl border border-slate-200 bg-white !p-0 shadow-sm">
          <CardHeader className="p-4 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                  Product Manifest
                </h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  Review individual items and totals for this lot
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-700"
                >
                  {manifestItems.length.toLocaleString()} items
                </Badge>
                <Badge
                  variant="outline"
                  className="border-slate-200 text-slate-800"
                >
                  {formatCurrency(totalExtRetailValue)} total value
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Alert */}
        <Alert className="border-slate-200 bg-slate-50">
          <Info className="h-4 w-4 flex-shrink-0 text-slate-600" />
          <AlertDescription className="text-sm text-slate-700">
            Product manifest from lot listing. Individual items and quantities
            may vary.
          </AlertDescription>
        </Alert>

        {/* Tabs */}
        <Tabs
          className="w-full flex-col justify-start gap-6"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          {/* Tab Nav + Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              {/* Mobile Selector */}
              <div className="block md:hidden">
                <Label className="sr-only" htmlFor="view-selector">
                  View
                </Label>
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger
                    className="flex w-fit rounded-md bg-white"
                    id="view-selector"
                    size="sm"
                  >
                    <SelectValue placeholder="Select a view" />
                  </SelectTrigger>
                  <SelectContent>
                    {tabOptions.map((t) => (
                      <SelectItem
                        key={t.value}
                        value={t.value}
                        className="text-[13px]"
                      >
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop Tabs */}
              <TabsList className="hidden gap-1 rounded-lg bg-slate-100 p-1 md:flex">
                {tabOptions.map((t) => (
                  <TabsTrigger
                    key={t.value}
                    value={t.value}
                    className="rounded-md px-3 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                  >
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Download */}
              <Button
                className="bg-slate-900 text-white shadow-sm hover:bg-slate-800"
                size="sm"
                disabled={isDownloading}
                onClick={handleDownloadManifest}
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

          {/* Full Manifest */}
          <TabsContent
            className="relative flex flex-col gap-4 overflow-auto"
            value="full"
          >
            {/* Filters + View */}
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-3">
              <span className="text-[13px] font-medium tracking-wide text-slate-700">
                Filter:
              </span>
              <div className="relative flex-1 md:max-w-md">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="rounded-md border-slate-200 pl-10 text-[13px] focus:border-slate-400 focus:ring-slate-400"
                  placeholder="Search manifest items..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
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

              {/* Column Visibility */}
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
                    .filter((c) => c.getCanHide())
                    .map((column) => {
                      const nameMap: Record<string, string> = {
                        title: "Product",
                        sku: "SKU",
                        product_condition: "Condition",
                        available_quantity: "Qty",
                        retail_price: "Unit Price",
                        ext_retail: "Ext. Retail",
                      };
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          checked={column.getIsVisible()}
                          className="capitalize"
                          onCheckedChange={(v) => column.toggleVisibility(!!v)}
                        >
                          {nameMap[column.id] || column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Data Table */}
            <div className="w-full">
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="min-w-full">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-slate-50">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead
                              key={header.id}
                              colSpan={header.colSpan}
                              className="sticky top-0 z-10 bg-slate-50 px-4 py-3 text-left font-medium whitespace-nowrap text-slate-900"
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
                            key={row.id}
                            className={`${row.index % 2 === 1 ? "bg-slate-50/60" : "bg-white"} hover:bg-slate-50`}
                            data-state={row.getIsSelected() && "selected"}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell
                                key={cell.id}
                                className="px-4 py-3 text-sm whitespace-nowrap"
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
                      {manifestItems.length > 0 && (
                        <TableRow className="border-t border-slate-200 bg-slate-50 font-semibold">
                          <TableCell className="px-4 py-3 text-sm font-bold text-slate-900">
                            Total
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm" />
                          <TableCell className="px-4 py-3 text-sm" />
                          <TableCell className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                            {totals.quantity.toLocaleString()}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm" />
                          <TableCell className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                            {formatCurrency(totals.extRetail)}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
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
                    value={`${table.getState().pagination.pageSize}`}
                    onValueChange={(v) => table.setPageSize(Number(v))}
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
                      {[10, 20, 30, 50, 100].map((s) => (
                        <SelectItem key={s} value={`${s}`}>
                          {s}
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
                  <span className="font-medium">Total Ext. Retail Value:</span>{" "}
                  <span className="font-bold text-slate-900">
                    {formatCurrency(totals.extRetail)}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Product Class */}
          <TabsContent value="product-class">
            <AggregatedDataTable
              data={useMemo(
                () => aggregateLotByProductClass(manifestItems),
                [manifestItems]
              )}
              groupColumnHeader="Product Class"
              searchPlaceholder="Search product classes..."
            />
          </TabsContent>

          {/* Category */}
          <TabsContent value="category">
            <AggregatedDataTable
              data={useMemo(
                () => aggregateLotByCategory(manifestItems),
                [manifestItems]
              )}
              groupColumnHeader="Category"
              searchPlaceholder="Search categories..."
            />
          </TabsContent>

          {/* Subcategory */}
          <TabsContent value="subcategory">
            <AggregatedDataTable
              data={useMemo(
                () => aggregateLotBySubcategory(manifestItems),
                [manifestItems]
              )}
              groupColumnHeader="Subcategory"
              searchPlaceholder="Search subcategories..."
            />
          </TabsContent>

          {/* Marketplace Data placeholder */}
          <TabsContent value="marketplace-data">
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                  <LayoutGrid className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Marketplace Data
                </h3>
                <p className="text-gray-500">Data coming soon</p>
                <div className="mt-4 text-sm text-gray-400">
                  We’re preparing marketplace insights for this lot
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
