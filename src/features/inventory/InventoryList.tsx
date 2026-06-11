import { useState } from "react"
import { useWarehouseStore, type InventoryItem } from "@/store/useWarehouseStore"
import { Search, Plus, ArrowLeftRight, Edit3, Warehouse, AlertTriangle, Calendar, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export function InventoryList() {
  const { products, warehouses, inventory, adjustStock, transferStock } = useWarehouseStore()
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("All")
  const [searchTerm, setSearchTerm] = useState("")

  // Adjustment Modal State
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null)
  
  // Adjustment Form
  const [adjustWhId, setAdjustWhId] = useState("")
  const [adjustProdId, setAdjustProdId] = useState("")
  const [adjustLot, setAdjustLot] = useState("")
  const [adjustExp, setAdjustExp] = useState("")
  const [adjustBin, setAdjustBin] = useState("")
  const [adjustQty, setAdjustQty] = useState(0)
  const [adjustReason, setAdjustReason] = useState("Cycle Count")

  // Transfer Modal State
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [transferItem, setTransferItem] = useState<InventoryItem | null>(null)
  
  // Transfer Form
  const [transToWhId, setTransToWhId] = useState("")
  const [transToBin, setTransToBin] = useState("")
  const [transQty, setTransQty] = useState(1)

  const getProductDetails = (prodId: string) => {
    return products.find((p) => p.id === prodId) || { name: "Unknown Product", sku: "N/A", category: "N/A", unitOfMeasure: "Units" }
  }

  const getWarehouseDetails = (whId: string) => {
    return warehouses.find((w) => w.id === whId) || { name: "Unknown Warehouse", code: "N/A" }
  }

  const openAdjust = (item?: InventoryItem) => {
    if (item) {
      setAdjustItem(item)
      setAdjustWhId(item.warehouseId)
      setAdjustProdId(item.productId)
      setAdjustLot(item.lotNumber)
      setAdjustExp(item.expirationDate)
      setAdjustBin(item.binLocation)
      setAdjustQty(item.quantityOnHand)
    } else {
      setAdjustItem(null)
      setAdjustWhId(warehouses[0]?.id || "")
      setAdjustProdId(products[0]?.id || "")
      setAdjustLot("")
      setAdjustExp("")
      setAdjustBin("")
      setAdjustQty(0)
    }
    setAdjustReason("Cycle Count")
    setIsAdjustOpen(true)
  }

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!adjustWhId || !adjustProdId || !adjustLot) return
    adjustStock(adjustWhId, adjustProdId, adjustLot, adjustExp, adjustBin, Number(adjustQty))
    setIsAdjustOpen(false)
  }

  const openTransfer = (item: InventoryItem) => {
    setTransferItem(item)
    setTransToWhId(warehouses.find((w) => w.id !== item.warehouseId)?.id || "")
    setTransToBin("")
    setTransQty(1)
    setIsTransferOpen(true)
  }

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!transferItem || !transToWhId) return
    transferStock(
      transferItem.warehouseId,
      transToWhId,
      transferItem.productId,
      transferItem.lotNumber,
      transferItem.binLocation,
      transToBin,
      Number(transQty)
    )
    setIsTransferOpen(false)
  }

  // Expiry check helper (relative to 2026-06-11)
  const isExpired = (expStr: string) => {
    if (!expStr) return false
    return new Date(expStr) < new Date("2026-06-11")
  }

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesWh = selectedWarehouseId === "All" || item.warehouseId === selectedWarehouseId
    const prod = getProductDetails(item.productId)
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.binLocation.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesWh && matchesSearch
  })

  // Calculations for summary stats
  const totalStockQty = filteredInventory.reduce((sum, item) => sum + item.quantityOnHand, 0)
  const expiredItems = filteredInventory.filter((item) => isExpired(item.expirationDate))
  const expiredQty = expiredItems.reduce((sum, item) => sum + item.quantityOnHand, 0)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
            Inventory Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Track lot batches, bin locations, and expiration dates. Process audits and internal transfers.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openAdjust()} className="rounded-xl border-white/10 shadow-sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" /> New Adjustment
          </Button>
        </div>
      </div>

      {/* Summary Bento Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-white/5 bg-background/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Total Items Filtered</span>
            <span className="text-2xl font-black text-foreground">{totalStockQty} units</span>
          </div>
        </Card>

        <Card className="border border-white/5 bg-background/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Warehouse className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Locations Active</span>
            <span className="text-2xl font-black text-foreground">
              {new Set(filteredInventory.map((i) => i.warehouseId)).size} Facilities
            </span>
          </div>
        </Card>

        <Card className="border border-white/5 bg-background/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Expired Stock Alert</span>
            <span className={`text-2xl font-black ${expiredQty > 0 ? "text-rose-500 animate-pulse" : "text-foreground"}`}>
              {expiredQty} units ({expiredItems.length} batches)
            </span>
          </div>
        </Card>
      </div>

      {/* Filters Card */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-background/40 backdrop-blur-sm p-4 rounded-2xl border border-white/5 shadow-sm">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by product, SKU, lot, bin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background/50 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto py-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2 shrink-0">
            Facility:
          </span>
          <button
            onClick={() => setSelectedWarehouseId("All")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              selectedWarehouseId === "All"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
            }`}
          >
            All Facilities
          </button>
          {warehouses.map((wh) => (
            <button
              key={wh.id}
              onClick={() => setSelectedWarehouseId(wh.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedWarehouseId === wh.id
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              {wh.name}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl border border-white/5 bg-background/30 backdrop-blur-md overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs text-muted-foreground uppercase tracking-wider bg-background/20">
                <th className="p-4 font-semibold">Product Spec</th>
                <th className="p-4 font-semibold">Warehouse</th>
                <th className="p-4 font-semibold">Lot & Expiry</th>
                <th className="p-4 font-semibold">Bin Location</th>
                <th className="p-4 font-semibold text-right">Quantity</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredInventory.map((item) => {
                const prod = getProductDetails(item.productId)
                const wh = getWarehouseDetails(item.warehouseId)
                const isItemExpired = isExpired(item.expirationDate)

                return (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div>
                        <span className="font-mono text-xs font-semibold text-muted-foreground">{prod.sku}</span>
                        <div className="font-bold text-foreground mt-0.5">{prod.name}</div>
                        <span className="text-[10px] text-muted-foreground uppercase bg-muted/50 px-1.5 py-0.5 rounded font-bold">
                          {prod.category}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-foreground/80">
                      <div className="flex items-center gap-1.5">
                        <Warehouse className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{wh.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="font-mono text-xs font-semibold">Lot: {item.lotNumber}</div>
                        {item.expirationDate ? (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Exp: {item.expirationDate}</span>
                            {isItemExpired && (
                              <Badge variant="destructive" className="text-[9px] font-black rounded px-1">
                                EXPIRED
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No Expiration</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-muted-foreground">{item.binLocation || "Unassigned"}</td>
                    <td className="p-4 text-right font-black text-foreground text-base">
                      {item.quantityOnHand} <span className="text-xs text-muted-foreground font-normal">{prod.unitOfMeasure}s</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-center">
                        <Button variant="ghost" size="icon" onClick={() => openAdjust(item)} title="Adjust Stock" className="rounded-lg hover:bg-primary/10 hover:text-primary">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openTransfer(item)} title="Transfer Stock" className="rounded-lg hover:bg-primary/10 hover:text-primary">
                          <ArrowLeftRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground bg-background/10">
                    No inventory items found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Dialog */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl border-white/10 glass-card">
          <form onSubmit={handleAdjustSubmit}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {adjustItem ? "Adjust Stock Quantity" : "New Inventory Audit / Log"}
              </DialogTitle>
              <DialogDescription>
                Directly audit or log inventory. This adjusts active inventory quantities and lot details.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {!adjustItem ? (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="adjWh">Warehouse / Facility</Label>
                    <select
                      id="adjWh"
                      value={adjustWhId}
                      onChange={(e) => setAdjustWhId(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="adjProd">Select Product</Label>
                    <select
                      id="adjProd"
                      value={adjustProdId}
                      onChange={(e) => setAdjustProdId(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                  <div className="text-xs text-muted-foreground">Adjusting:</div>
                  <div className="font-bold">{getProductDetails(adjustProdId).name}</div>
                  <div className="text-xs font-semibold text-muted-foreground">{getWarehouseDetails(adjustWhId).name}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="adjLot">Lot Number *</Label>
                  <Input
                    id="adjLot"
                    value={adjustLot}
                    onChange={(e) => setAdjustLot(e.target.value)}
                    required
                    disabled={!!adjustItem}
                    placeholder="e.g. LOT-2026X"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="adjExp">Expiration Date</Label>
                  <Input
                    id="adjExp"
                    type="date"
                    value={adjustExp}
                    onChange={(e) => setAdjustExp(e.target.value)}
                    disabled={!!adjustItem}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="adjBin">Bin Location</Label>
                  <Input
                    id="adjBin"
                    placeholder="e.g. BIN-A4"
                    value={adjustBin}
                    onChange={(e) => setAdjustBin(e.target.value)}
                    disabled={!!adjustItem}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="adjQty">New Quantity</Label>
                  <Input
                    id="adjQty"
                    type="number"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(Number(e.target.value))}
                    min={0}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adjReason">Adjustment Reason</Label>
                <select
                  id="adjReason"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="Cycle Count">Cycle Count Audit</option>
                  <option value="Damaged">Damaged / Destroyed</option>
                  <option value="Expired">Expired Stock Disposal</option>
                  <option value="Supplier Correct">Supplier Correction</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsAdjustOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl">
                Apply Adjustment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transfer Stock Dialog */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl border-white/10 glass-card">
          <form onSubmit={handleTransferSubmit}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Transfer Inventory</DialogTitle>
              <DialogDescription>
                Move quantities between facilities or storage zones.
              </DialogDescription>
            </DialogHeader>

            {transferItem && (
              <div className="grid gap-4 py-4">
                <div className="p-3 bg-muted/40 rounded-xl space-y-1.5">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Source Details</div>
                  <div className="font-bold">{getProductDetails(transferItem.productId).name}</div>
                  <div className="text-xs space-y-0.5">
                    <div>Facility: <span className="font-semibold">{getWarehouseDetails(transferItem.warehouseId).name}</span></div>
                    <div>Lot: <span className="font-semibold font-mono">{transferItem.lotNumber}</span> | Bin: <span className="font-semibold">{transferItem.binLocation || "Unassigned"}</span></div>
                    <div>Qty Available: <span className="font-black text-primary">{transferItem.quantityOnHand}</span></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="transWh">Destination Facility *</Label>
                  <select
                    id="transWh"
                    value={transToWhId}
                    onChange={(e) => setTransToWhId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="transBin">Destination Bin</Label>
                    <Input
                      id="transBin"
                      placeholder="e.g. BIN-X2"
                      value={transToBin}
                      onChange={(e) => setTransToBin(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="transQty">Transfer Quantity</Label>
                    <Input
                      id="transQty"
                      type="number"
                      value={transQty}
                      onChange={(e) => setTransQty(Number(e.target.value))}
                      min={1}
                      max={transferItem.quantityOnHand}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsTransferOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl">
                Complete Transfer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
