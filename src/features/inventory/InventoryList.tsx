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
  const { products, warehouses, inventory, adjustStock, transferStock, zones, binLocations, selectedWarehouseId } = useWarehouseStore()
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
  const [adjustZoneId, setAdjustZoneId] = useState("")

  // Transfer Modal State
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [transferItem, setTransferItem] = useState<InventoryItem | null>(null)
  
  // Transfer Form
  const [transToWhId, setTransToWhId] = useState("")
  const [transToBin, setTransToBin] = useState("")
  const [transQty, setTransQty] = useState(1)
  const [transToZoneId, setTransToZoneId] = useState("")

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
      setAdjustZoneId("")
    } else {
      setAdjustItem(null)
      const defaultWh = selectedWarehouseId || warehouses[0]?.id || ""
      setAdjustWhId(defaultWh)
      setAdjustProdId(products[0]?.id || "")
      setAdjustLot("")
      setAdjustExp("")
      
      const whZones = zones.filter((z) => z.warehouseId === defaultWh)
      const defaultZone = whZones[0]?.id || ""
      setAdjustZoneId(defaultZone)

      const zoneBins = binLocations.filter(
        (b) => b.warehouseId === defaultWh && (!defaultZone || b.zoneId === defaultZone)
      )
      setAdjustBin(zoneBins[0]?.code || "")
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
    const otherWh = warehouses.find((w) => w.id !== item.warehouseId)?.id || ""
    setTransToWhId(otherWh)
    
    const whZones = zones.filter((z) => z.warehouseId === otherWh)
    const defaultZone = whZones[0]?.id || ""
    setTransToZoneId(defaultZone)

    const zoneBins = binLocations.filter(
      (b) => b.warehouseId === otherWh && (!defaultZone || b.zoneId === defaultZone)
    )
    setTransToBin(zoneBins[0]?.code || "")

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
    const matchesWh = item.warehouseId === selectedWarehouseId
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
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
            Inventory Management
          </h2>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Track lot batches, bin locations, and expiration dates. Process audits and internal transfers.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => openAdjust()} className="w-full sm:w-auto rounded-xl border-white/10 shadow-sm shrink-0" variant="outline">
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
        <div className="flex items-center gap-2 w-full md:w-auto py-1 overflow-x-auto scrollbar-hide">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2 shrink-0">
            Active Facility:
          </span>
          <Badge variant="outline" className="shrink-0 px-3 py-1.5 bg-primary/10 border-primary/20 text-primary font-bold text-xs rounded-full">
            {getWarehouseDetails(selectedWarehouseId || "").code} - {getWarehouseDetails(selectedWarehouseId || "").name}
          </Badge>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl border border-white/5 bg-background/30 backdrop-blur-md overflow-hidden shadow">
        <div className="overflow-x-auto">
          {/* Desktop Table View */}
          <table className="w-full text-left border-collapse hidden md:table">
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
                const binObj = binLocations.find(
                  (b) => b.warehouseId === item.warehouseId && (b.code === item.binLocation || b.id === item.binLocation)
                )
                const zoneObj = binObj ? zones.find((z) => z.id === binObj.zoneId) : null

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
                    <td className="p-4 font-semibold text-muted-foreground">
                      <div className="space-y-0.5">
                        <div className="text-primary font-mono">{item.binLocation || "Unassigned"}</div>
                        {zoneObj && (
                          <div className="text-[10px] text-muted-foreground font-normal">
                            {zoneObj.name.split(" - ")[0]}
                          </div>
                        )}
                      </div>
                    </td>
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

          {/* Mobile / Tablet Grid View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:hidden">
            {filteredInventory.map((item) => {
              const prod = getProductDetails(item.productId)
              const wh = getWarehouseDetails(item.warehouseId)
              const isItemExpired = isExpired(item.expirationDate)
              const binObj = binLocations.find(
                (b) => b.warehouseId === item.warehouseId && (b.code === item.binLocation || b.id === item.binLocation)
              )
              const zoneObj = binObj ? zones.find((z) => z.id === binObj.zoneId) : null
              
              return (
                <div key={item.id} className="bg-background/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3 transition-colors hover:bg-white/5">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 pr-2">
                      <span className="font-mono text-xs font-semibold text-muted-foreground block truncate">{prod.sku}</span>
                      <div className="font-bold text-foreground mt-0.5 text-sm line-clamp-2">{prod.name}</div>
                      <span className="text-[10px] text-muted-foreground uppercase bg-muted/50 px-1.5 py-0.5 rounded font-bold mt-1 inline-block">
                        {prod.category}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-foreground text-lg leading-none">{item.quantityOnHand}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{prod.unitOfMeasure}s</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs border-y border-white/5 py-2 my-1">
                    <div className="min-w-0">
                      <div className="text-muted-foreground mb-1">Location</div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Warehouse className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{wh.name}</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-muted-foreground mb-1">Bin / Zone</div>
                      <div className="font-medium text-primary font-mono truncate">{item.binLocation || "Unassigned"}</div>
                      {zoneObj && <div className="text-[10px] text-muted-foreground truncate">{zoneObj.name.split(" - ")[0]}</div>}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs pt-1">
                    <div className="space-y-1">
                      <div className="font-mono font-semibold">Lot: {item.lotNumber}</div>
                      {item.expirationDate && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className={isItemExpired ? "text-rose-500 font-bold" : ""}>Exp: {item.expirationDate}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <Button variant="ghost" size="icon" onClick={() => openAdjust(item)} className="h-8 w-8 rounded-lg bg-background/50 border border-white/5 hover:bg-primary/10 hover:text-primary">
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openTransfer(item)} className="h-8 w-8 rounded-lg bg-background/50 border border-white/5 hover:bg-primary/10 hover:text-primary">
                        <ArrowLeftRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
            {filteredInventory.length === 0 && (
              <div className="col-span-full py-8 text-center text-muted-foreground bg-background/10 rounded-xl">
                No inventory items found matching filters.
              </div>
            )}
          </div>
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
                      disabled
                      onChange={(e) => {
                        const newWhId = e.target.value
                        setAdjustWhId(newWhId)
                        const whZones = zones.filter((z) => z.warehouseId === newWhId)
                        const defaultZone = whZones[0]?.id || ""
                        setAdjustZoneId(defaultZone)
                        const zoneBins = binLocations.filter(
                          (b) => b.warehouseId === newWhId && (!defaultZone || b.zoneId === defaultZone)
                        )
                        setAdjustBin(zoneBins[0]?.code || "")
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-not-allowed opacity-70"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="adjZone">Zone</Label>
                      <select
                        id="adjZone"
                        value={adjustZoneId}
                        onChange={(e) => {
                          const newZoneId = e.target.value
                          setAdjustZoneId(newZoneId)
                          const zoneBins = binLocations.filter(
                            (b) => b.warehouseId === adjustWhId && b.zoneId === newZoneId
                          )
                          setAdjustBin(zoneBins[0]?.code || "")
                        }}
                        className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {zones
                          .filter((z) => z.warehouseId === adjustWhId)
                          .map((z) => (
                            <option key={z.id} value={z.id}>{z.name}</option>
                          ))}
                        {zones.filter((z) => z.warehouseId === adjustWhId).length === 0 && (
                          <option value="">No Zones Configured</option>
                        )}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="adjBinSelect">Bin Location</Label>
                      <select
                        id="adjBinSelect"
                        value={adjustBin}
                        onChange={(e) => setAdjustBin(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {binLocations
                          .filter((b) => b.warehouseId === adjustWhId && b.zoneId === adjustZoneId)
                          .map((b) => (
                            <option key={b.id} value={b.code}>{b.code}</option>
                          ))}
                        {binLocations.filter((b) => b.warehouseId === adjustWhId && b.zoneId === adjustZoneId).length === 0 && (
                          <option value="">No Bins Configured</option>
                        )}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                  <div className="text-xs text-muted-foreground">Adjusting:</div>
                  <div className="font-bold">{getProductDetails(adjustProdId).name}</div>
                  <div className="text-xs font-semibold text-muted-foreground">{getWarehouseDetails(adjustWhId).name}</div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {adjustItem && (
                  <div className="space-y-1.5">
                    <Label htmlFor="adjBin">Bin Location</Label>
                    <Input
                      id="adjBin"
                      value={adjustBin}
                      disabled
                      className="rounded-xl"
                    />
                  </div>
                )}
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

            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button type="button" variant="ghost" onClick={() => setIsAdjustOpen(false)} className="rounded-xl w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl w-full sm:w-auto">
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
                    onChange={(e) => {
                      const newWhId = e.target.value
                      setTransToWhId(newWhId)
                      const whZones = zones.filter((z) => z.warehouseId === newWhId)
                      const defaultZone = whZones[0]?.id || ""
                      setTransToZoneId(defaultZone)
                      const zoneBins = binLocations.filter(
                        (b) => b.warehouseId === newWhId && (!defaultZone || b.zoneId === defaultZone)
                      )
                      setTransToBin(zoneBins[0]?.code || "")
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {warehouses
                      .filter((w) => w.id !== selectedWarehouseId)
                      .map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="transZone">Destination Zone</Label>
                    <select
                      id="transZone"
                      value={transToZoneId}
                      onChange={(e) => {
                        const newZoneId = e.target.value
                        setTransToZoneId(newZoneId)
                        const zoneBins = binLocations.filter(
                          (b) => b.warehouseId === transToWhId && b.zoneId === newZoneId
                        )
                        setTransToBin(zoneBins[0]?.code || "")
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {zones
                        .filter((z) => z.warehouseId === transToWhId)
                        .map((z) => (
                          <option key={z.id} value={z.id}>{z.name}</option>
                        ))}
                      {zones.filter((z) => z.warehouseId === transToWhId).length === 0 && (
                        <option value="">No Zones Configured</option>
                      )}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="transBinSelect">Destination Bin</Label>
                    <select
                      id="transBinSelect"
                      value={transToBin}
                      onChange={(e) => setTransToBin(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {binLocations
                        .filter((b) => b.warehouseId === transToWhId && b.zoneId === transToZoneId)
                        .map((b) => (
                          <option key={b.id} value={b.code}>{b.code}</option>
                        ))}
                      {binLocations.filter((b) => b.warehouseId === transToWhId && b.zoneId === transToZoneId).length === 0 && (
                        <option value="">No Bins Configured</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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

            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button type="button" variant="ghost" onClick={() => setIsTransferOpen(false)} className="rounded-xl w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl w-full sm:w-auto">
                Complete Transfer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
