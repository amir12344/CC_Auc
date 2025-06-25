'use client';

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Info,
  LayoutGrid,
  Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Card, CardHeader } from '@/src/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/src/components/ui/tabs';
import type { ManifestItem } from '../types';

interface ManifestTableProps {
  /** Auction manifest data from API */
  manifestData: ManifestItem[];
}

// Define columns for ManifestItem data - in same order as query
const columns: ColumnDef<ManifestItem>[] = [
  {
    accessorKey: 'title',
    header: 'Product Name',
    cell: ({ row }) => (
      <Badge
        className="border-slate-200 bg-slate-50 font-medium text-slate-700 text-xs"
        variant="outline"
      >
        {row.original.title}
      </Badge>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate text-slate-900 text-sm">
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: 'retail_price',
    header: () => <div className="text-right">Retail Price</div>,
    cell: ({ row }) => {
      const price =
        Number.parseFloat(row.original.retail_price.replace(/[$,]/g, '')) || 0;
      return (
        <div className="text-right font-medium text-slate-900 text-sm">
          ${price.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: 'ext_retail',
    header: () => <div className="text-right">Ext. Retail</div>,
    cell: ({ row }) => {
      const price =
        Number.parseFloat(
          row.original.ext_retail?.replace(/[$,]/g, '') || '0'
        ) || 0;
      return (
        <div className="text-right font-medium text-slate-900 text-sm">
          ${price.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: ({ row }) => (
      <span className="font-mono text-slate-600 text-xs">
        {row.original.sku}
      </span>
    ),
  },
  {
    accessorKey: 'available_quantity',
    header: () => <div className="text-center">Qty</div>,
    cell: ({ row }) => (
      <div className="text-center font-medium text-slate-900 text-sm">
        {row.original.available_quantity}
      </div>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <Badge
        className="border-blue-200 bg-blue-50 text-blue-700 text-xs"
        variant="outline"
      >
        {row.original.category}
      </Badge>
    ),
  },
  {
    accessorKey: 'subcategory',
    header: 'Subcategory',
    cell: ({ row }) => (
      <Badge
        className="border-purple-200 bg-purple-50 text-purple-700 text-xs"
        variant="outline"
      >
        {row.original.subcategory}
      </Badge>
    ),
  },
  {
    accessorKey: 'product_condition',
    header: 'Product Condition',
    cell: ({ row }) => (
      <Badge
        className={`text-xs ${row.original.product_condition?.toLowerCase() === 'new'
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-yellow-200 bg-yellow-50 text-yellow-700'
          }`}
        variant="outline"
      >
        {row.original.product_condition}
      </Badge>
    ),
  },
  {
    accessorKey: 'cosmetic_condition',
    header: 'Cosmetic Condition',
    cell: ({ row }) => (
      <span className="text-slate-600 text-sm">
        {row.original.cosmetic_condition}
      </span>
    ),
  },
  {
    accessorKey: 'identifier',
    header: 'Identifier',
    cell: ({ row }) => (
      <span className="font-mono text-slate-600 text-xs">
        {row.original.identifier}
      </span>
    ),
  },
  {
    accessorKey: 'identifier_type',
    header: 'ID Type',
    cell: ({ row }) => (
      <Badge
        className="border-gray-200 bg-gray-50 text-gray-700 text-xs"
        variant="outline"
      >
        {row.original.identifier_type}
      </Badge>
    ),
  },
  {
    accessorKey: 'is_hazmat',
    header: () => <div className="text-center">Hazmat</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.is_hazmat ? (
          <Badge
            className="border-red-200 bg-red-50 text-red-700 text-xs"
            variant="outline"
          >
            Yes
          </Badge>
        ) : (
          <Badge
            className="border-gray-200 bg-gray-50 text-gray-700 text-xs"
            variant="outline"
          >
            No
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'model_name',
    header: 'Model Name',
    cell: ({ row }) => (
      <span className="text-slate-900 text-sm">{row.original.model_name}</span>
    ),
  },
];

const tabOptions = [
  { value: 'full', label: 'Full Manifest' },
  { value: 'product-class', label: 'Product Class' },
  { value: 'gi-description', label: 'GI Description' },
  { value: 'category', label: 'Category' },
  { value: 'subcategory', label: 'Subcategory' },
];

export function ManifestTable({ manifestData }: ManifestTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [activeTab, setActiveTab] = useState('full');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Calculate total value using ext_retail
  const totalValue = useMemo(() => {
    return manifestData.reduce((sum, row) => {
      const extRetail =
        Number.parseFloat(row.ext_retail?.replace(/[$,]/g, '') || '0') || 0;
      const retailPrice =
        Number.parseFloat(row.retail_price?.replace(/[$,]/g, '') || '0') || 0;
      // Use ext_retail if available, fallback to retail_price
      const price = extRetail > 0 ? extRetail : retailPrice;
      return sum + price;
    }, 0);
  }, [manifestData]);

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
    globalFilterFn: 'includesString',
  });

  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-8xl space-y-4 p-4 md:space-y-6 md:p-6">
        {/* Header */}
        <Card className="!p-0 rounded-lg shadow-sm ">
          <CardHeader className="bg-slate-900 p-4 text-white md:p-6">
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
              <h1 className="font-semibold text-xl tracking-tight md:text-2xl">
                MANIFEST
              </h1>
              <div className="text-slate-300 text-xs md:text-sm">
                {manifestData.length} items • ${totalValue.toLocaleString()}{' '}
                total value
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Alert */}
        <Alert className="border-slate-200 bg-slate-50">
          <Info className="h-4 w-4 flex-shrink-0 text-slate-600" />
          <AlertDescription className="text-slate-700 text-sm">
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
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Manifest
              </Button>
            </div>
          </div>

          {/* Tab Content */}
          <TabsContent
            className="relative flex flex-col gap-4 overflow-auto px-4 px-0"
            value="full"
          >
            {/* Search Controls */}
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-3 md:space-y-0">
              <span className="font-medium text-slate-700 text-sm">
                Filter:
              </span>
              <div className="relative flex-1 md:max-w-md">
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-slate-400" />
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
                      const getColumnDisplayName = (columnId: string): string => {
                        const columnNameMap: Record<string, string> = {
                          title: 'Product Name',
                          description: 'Description',
                          retail_price: 'Retail Price',
                          ext_retail: 'Ext. Retail',
                          sku: 'SKU',
                          available_quantity: 'Qty',
                          category: 'Category',
                          subcategory: 'Subcategory',
                          product_condition: 'Product Condition',
                          cosmetic_condition: 'Cosmetic Condition',
                          identifier: 'Identifier',
                          identifier_type: 'ID Type',
                          is_hazmat: 'Hazmat',
                          model_name: 'Model Name'
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
                              className='sticky top-0 z-10 whitespace-nowrap bg-slate-50 px-4 py-3 text-left font-medium text-slate-900'
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
                            data-state={row.getIsSelected() && 'selected'}
                            key={row.id}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell
                                className="whitespace-nowrap px-4 py-3 text-sm"
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
              <div className="mt-2 text-center text-muted-foreground text-xs md:hidden">
                ← Scroll horizontally to view all columns →
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="hidden flex-1 text-muted-foreground text-sm lg:flex">
                Showing{' '}
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}{' '}
                to{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{' '}
                of {table.getFilteredRowModel().rows.length} entries
              </div>
              <div className="flex w-full items-center gap-4 lg:w-fit lg:gap-8">
                <div className="hidden items-center gap-2 lg:flex">
                  <Label
                    className="font-medium text-sm"
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
                <div className="flex w-fit items-center justify-center font-medium text-sm">
                  Page {table.getState().pagination.pageIndex + 1} of{' '}
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
                <div className="text-slate-600 text-sm">
                  <span className="font-medium">Total Items:</span>{' '}
                  {manifestData.length}
                </div>
                <div className="text-slate-600 text-sm">
                  <span className="font-medium">Total Retail Value:</span>{' '}
                  <span className="font-bold text-slate-900">
                    ${totalValue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Other Tab Contents */}
          <TabsContent
            className="flex flex-col px-4 lg:px-6"
            value="product-class"
          >
            <div className="flex aspect-video w-full flex-1 items-center justify-center rounded-lg border border-dashed bg-muted/10">
              <p className="text-muted-foreground">
                Product Class view coming soon...
              </p>
            </div>
          </TabsContent>

          <TabsContent
            className="flex flex-col px-4 lg:px-6"
            value="gi-description"
          >
            <div className="flex aspect-video w-full flex-1 items-center justify-center rounded-lg border border-dashed bg-muted/10">
              <p className="text-muted-foreground">
                GI Description view coming soon...
              </p>
            </div>
          </TabsContent>

          <TabsContent className="flex flex-col px-4 lg:px-6" value="category">
            <div className="flex aspect-video w-full flex-1 items-center justify-center rounded-lg border border-dashed bg-muted/10">
              <p className="text-muted-foreground">
                Category view coming soon...
              </p>
            </div>
          </TabsContent>

          <TabsContent
            className="flex flex-col px-4 lg:px-6"
            value="subcategory"
          >
            <div className="flex aspect-video w-full flex-1 items-center justify-center rounded-lg border border-dashed bg-muted/10">
              <p className="text-muted-foreground">
                Subcategory view coming soon...
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
