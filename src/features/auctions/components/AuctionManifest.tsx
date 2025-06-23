"use client"

import { useState, useMemo } from "react"
import { Download, Search, Info, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { Alert, AlertDescription } from "@/src/components/ui/alert"
import { Tabs, TabsContent } from "@/src/components/ui/tabs"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"

const manifestData = [
  {
    id: 1,
    productClass: "BICYCLES PHYSICAL FITNESS",
    asin: "LPHP247109",
    itemDescription: "Owala 40oz Stainless Steel Straw Tumbler",
    qty: 2,
    unitPrice: 28,
  },
  {
    id: 2,
    productClass: "BICYCLES PHYSICAL FITNESS",
    asin: "LPHP247135",
    itemDescription: "Owala 40oz Stainless Steel Straw Tumbler",
    qty: 15,
    unitPrice: 79,
  },
  {
    id: 3,
    productClass: "ELECTRONICS ACCESSORIES",
    asin: "TECH001234",
    itemDescription: "Wireless Bluetooth Earbuds Pro",
    qty: 8,
    unitPrice: 89,
  },
  {
    id: 4,
    productClass: "HOME & GARDEN",
    asin: "HOME567890",
    itemDescription: "Smart LED Light Bulb Set",
    qty: 12,
    unitPrice: 45,
  },
  {
    id: 5,
    productClass: "SPORTS & OUTDOORS",
    asin: "SPORT123456",
    itemDescription: "Premium Yoga Mat with Carrying Strap",
    qty: 6,
    unitPrice: 35,
  },
  {
    id: 6,
    productClass: "KITCHEN & DINING",
    asin: "KITCH789012",
    itemDescription: "Stainless Steel Coffee Maker with Timer",
    qty: 4,
    unitPrice: 125,
  },
  {
    id: 7,
    productClass: "ELECTRONICS ACCESSORIES",
    asin: "TECH345678",
    itemDescription: "USB-C Fast Charging Cable 6ft",
    qty: 20,
    unitPrice: 15,
  },
]

type SortField = "productClass" | "asin" | "itemDescription" | "qty" | "unitPrice"
type SortDirection = "asc" | "desc"

const tabOptions = [
  { value: "full", label: "Full Manifest" },
  { value: "product-class", label: "Product Class" },
  { value: "gi-description", label: "GI Description" },
  { value: "category", label: "Category" },
  { value: "subcategory", label: "Subcategory" },
]

export function ManifestTable() {
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<SortField>("asin")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [activeTab, setActiveTab] = useState("full")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400 md:h-4 md:w-4" />
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-3 w-3 text-slate-600 md:h-4 md:w-4" />
    ) : (
      <ChevronDown className="h-3 w-3 text-slate-600 md:h-4 md:w-4" />
    )
  }

  const sortedAndFilteredData = useMemo(() => {
    const filtered = manifestData.filter(
      (row) =>
        row.productClass.toLowerCase().includes(search.toLowerCase()) ||
        row.asin.toLowerCase().includes(search.toLowerCase()) ||
        row.itemDescription.toLowerCase().includes(search.toLowerCase()),
    )

    return filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [search, sortField, sortDirection])

  const totalQty = sortedAndFilteredData.reduce((s, r) => s + r.qty, 0)
  const totalValue = sortedAndFilteredData.reduce((s, r) => s + r.qty * r.unitPrice, 0)

  return (
    <div className="bg-gray-50">
      <div className="max-w-8xl mx-auto space-y-4 p-4 md:space-y-6 md:p-6">
        {/* Header */}
        <Card className="border-0 shadow-sm !p-0">
          <CardHeader className="bg-slate-900 text-white p-4 md:p-6">
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
              <h1 className="text-xl font-semibold tracking-tight md:text-2xl">MANIFEST</h1>
              <div className="text-xs text-slate-300 md:text-sm">
                {manifestData.length} items • ${totalValue.toLocaleString()} total
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Alert */}
        <Alert className="border-slate-200 bg-slate-50">
          <Info className="h-4 w-4 text-slate-600 flex-shrink-0" />
          <AlertDescription className="text-slate-700 text-sm">
            There might be a 5% variance in the value, unit count, and/or condition listed below. Disputes within the
            declared variance will not be accepted.
          </AlertDescription>
        </Alert>

        {/* Navigation and Actions */}
        <div className="space-y-4">
          {/* Mobile Tab Selector */}
          <div className="block md:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select view" />
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
          <div className="hidden md:block">
            <div className="flex flex-wrap gap-1 rounded-lg border bg-white p-1">
              {tabOptions.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeTab === tab.value
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Download Button */}
          <div className="flex justify-end">
            <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 shadow-sm md:w-auto">
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Download Full Manifest</span>
              <span className="sm:hidden">Download</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4 md:space-y-6">
          <TabsContent value="full" className="space-y-4 md:space-y-6 mt-0">
            {/* Search */}
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-3 md:space-y-0">
              <span className="text-sm font-medium text-slate-700">Filter:</span>
              <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search manifest items..."
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                />
              </div>
              {search && (
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-700 border-slate-200 self-start md:self-center"
                >
                  {sortedAndFilteredData.length} results
                </Badge>
              )}
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden space-y-3">
              {sortedAndFilteredData.map((row) => (
                <Card key={row.id} className="border-slate-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <Badge
                          variant="outline"
                          className="font-medium bg-slate-50 text-slate-700 border-slate-200 text-xs"
                        >
                          {row.productClass}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm font-medium text-slate-900">${row.unitPrice}</div>
                          <div className="text-xs text-slate-500">Unit Price</div>
                        </div>
                      </div>

                      <div>
                        <div className="font-medium text-slate-900 text-sm">{row.itemDescription}</div>
                        <div className="text-xs text-slate-500 font-mono mt-1">{row.asin}</div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <div className="text-xs text-slate-500">Quantity</div>
                        <span className="inline-flex items-center justify-center w-8 h-6 text-sm font-medium bg-slate-100 text-slate-700 rounded">
                          {row.qty}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Mobile Total */}
              <Card className="border-slate-900 bg-slate-900 text-white">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <div className="text-right">
                      <div className="font-semibold">{totalQty} items</div>
                      <div className="font-semibold">${totalValue.toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Desktop Table View */}
            <Card className="border-slate-200 shadow-sm hidden md:block !p-0">
              <CardContent className="!p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 border-b border-slate-200">
                        <TableHead
                          className="h-12 px-4 font-semibold text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => handleSort("productClass")}
                        >
                          <div className="flex items-center gap-2">
                            Product Class
                            {getSortIcon("productClass")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="font-semibold text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => handleSort("asin")}
                        >
                          <div className="flex items-center gap-2">
                            ASIN
                            {getSortIcon("asin")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="font-semibold text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => handleSort("itemDescription")}
                        >
                          <div className="flex items-center gap-2">
                            Item Description
                            {getSortIcon("itemDescription")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-right font-semibold text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => handleSort("qty")}
                        >
                          <div className="flex items-center justify-end gap-2">
                            Qty
                            {getSortIcon("qty")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-right font-semibold text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => handleSort("unitPrice")}
                        >
                          <div className="flex items-center justify-end gap-2">
                            Unit Price
                            {getSortIcon("unitPrice")}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedAndFilteredData.map((row, index) => (
                        <TableRow
                          key={row.id}
                          className={`transition-colors hover:bg-slate-50 ${index % 2 === 0 ? "bg-white" : "bg-slate-25"
                            }`}
                        >
                          <TableCell className="py-4 p-4 ">
                            <Badge
                              variant="outline"
                              className="font-medium bg-slate-50 text-slate-700 border-slate-200"
                            >
                              {row.productClass}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm text-slate-600">{row.asin}</TableCell>
                          <TableCell className="max-w-xs py-4">
                            <div className="font-medium text-slate-900 truncate" title={row.itemDescription}>
                              {row.itemDescription}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="inline-flex items-center justify-center w-8 h-6 text-sm font-medium bg-slate-100 text-slate-700 rounded">
                              {row.qty}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium text-slate-900">${row.unitPrice}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow className="bg-slate-900 text-white hover:bg-slate-900">
                        <TableCell colSpan={3} className="p-4 text-right font-semibold">
                          Total
                        </TableCell>
                        <TableCell className="text-right font-semibold">{totalQty}</TableCell>
                        <TableCell className="text-right font-semibold">${totalValue.toLocaleString()}</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="flex flex-col space-y-2 text-sm text-slate-600 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div>
                Showing <span className="font-medium text-slate-900">{sortedAndFilteredData.length}</span> of{" "}
                <span className="font-medium text-slate-900">{manifestData.length}</span> entries
              </div>
              <div className="hidden md:block">
                Sorted by: <span className="font-medium text-slate-900">{sortField}</span> ({sortDirection})
              </div>
            </div>
          </TabsContent>

          {/* Placeholder content for other tabs */}
          <TabsContent value="product-class" className="text-center text-slate-500 py-12 md:py-16 mt-0">
            <div className="space-y-3">
              <div className="text-3xl text-slate-400 md:text-4xl">📦</div>
              <p className="text-base font-medium text-slate-700 md:text-lg">Product Class View</p>
              <p className="text-slate-500 text-sm md:text-base">Group items by product classification</p>
            </div>
          </TabsContent>
          <TabsContent value="gi-description" className="text-center text-slate-500 py-12 md:py-16 mt-0">
            <div className="space-y-3">
              <div className="text-3xl text-slate-400 md:text-4xl">📝</div>
              <p className="text-base font-medium text-slate-700 md:text-lg">GI Description View</p>
              <p className="text-slate-500 text-sm md:text-base">Detailed item descriptions and specifications</p>
            </div>
          </TabsContent>
          <TabsContent value="category" className="text-center text-slate-500 py-12 md:py-16 mt-0">
            <div className="space-y-3">
              <div className="text-3xl text-slate-400 md:text-4xl">🏷️</div>
              <p className="text-base font-medium text-slate-700 md:text-lg">Category View</p>
              <p className="text-slate-500 text-sm md:text-base">Browse items organized by categories</p>
            </div>
          </TabsContent>
          <TabsContent value="subcategory" className="text-center text-slate-500 py-12 md:py-16 mt-0">
            <div className="space-y-3">
              <div className="text-3xl text-slate-400 md:text-4xl">🏷️</div>
              <p className="text-base font-medium text-slate-700 md:text-lg">Subcategory View</p>
              <p className="text-slate-500 text-sm md:text-base">Browse items organized by subcategories</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 