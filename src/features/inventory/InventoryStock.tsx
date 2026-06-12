import { useState } from "react"
import { useWarehouseStore } from "@/store/useWarehouseStore"
import { Search, Calendar, AlertCircle, ShieldAlert, BadgeInfo } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function InventoryStock() {
  const { products, warehouses, inventory, zones, binLocations, selectedWarehouseId } = useWarehouseStore()
  const [selectedZoneId, setSelectedZoneId] = useState<string>("All")
  const [selectedBinId, setSelectedBinId] = useState<string>("All")
  const [searchTerm, setSearchTerm] = useState("")

  const getProductDetails = (prodId: string) => {
    return products.find((p) => p.id === prodId) || { name: "Unknown Product", sku: "N/A", category: "N/A", unitOfMeasure: "Units", minLevel: 0 }
  }

  const getWarehouseDetails = (whId: string) => {
    return warehouses.find((w) => w.id === whId) || { name: "Unknown Warehouse", code: "N/A" }
  }

  // Verification/inspection alert (relative to current date 2026-06-12)
  const isInspectionDue = (expStr: string) => {
    if (!expStr) return false
    const expDate = new Date(expStr)
    const currentDate = new Date("2026-06-12")
    const diffTime = expDate.getTime() - currentDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays < 180 // Due for inspection within 6 months
  }

  const isExpired = (expStr: string) => {
    if (!expStr) return false
    return new Date(expStr) < new Date("2026-06-12")
  }

  const filteredInventory = inventory.filter((item) => {
    const matchesWh = item.warehouseId === selectedWarehouseId
    
    // Zone & Bin filtering
    let matchesZone = true
    let matchesBin = true
    
    const binObj = binLocations.find(
      (b) => b.warehouseId === item.warehouseId && (b.code === item.binLocation || b.id === item.binLocation)
    )
    
    if (selectedZoneId !== "All") {
      matchesZone = binObj ? binObj.zoneId === selectedZoneId : false
    }
    if (selectedBinId !== "All") {
      matchesBin = item.binLocation === selectedBinId
    }

    const prod = getProductDetails(item.productId)
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.binLocation.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesWh && matchesZone && matchesBin && matchesSearch
  })

  // Calculate stock status summaries
  const totalStockItems = filteredInventory.reduce((sum, item) => sum + item.quantityOnHand, 0)
  const expiredCount = filteredInventory.filter((item) => isExpired(item.expirationDate)).length
  const inspectionDueCount = filteredInventory.filter((item) => !isExpired(item.expirationDate) && isInspectionDue(item.expirationDate)).length

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
          Detailed Bin Stock & Batches
        </h2>
        <p className="text-muted-foreground mt-0.5">
          Real-time physical ledger of fire fighting equipment, cylinder pressure certs, and warehouse locations.
        </p>
      </div>

      {/* Summary Bento Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-white/5 bg-background/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <BadgeInfo className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Total Tracked Quantity</span>
            <span className="text-2xl font-black text-foreground">{totalStockItems} Units</span>
          </div>
        </Card>

        <Card className="border border-white/5 bg-background/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Inspection Due (&lt; 180 Days)</span>
            <span className="text-2xl font-black text-foreground">{inspectionDueCount} Lots</span>
          </div>
        </Card>

        <Card className="border border-white/5 bg-background/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Expired Certificates</span>
            <span className={`text-2xl font-black ${expiredCount > 0 ? "text-rose-500 animate-pulse" : "text-foreground"}`}>
              {expiredCount} Lots
            </span>
          </div>
        </Card>
      </div>

      {/* Filters Card */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-background/40 backdrop-blur-sm p-4 rounded-2xl border border-white/5 shadow-sm">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search SKU, Lot, Bin Location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background/50 rounded-xl"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto py-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2 shrink-0">
            Active Warehouse/Facility:
          </span>
          <Badge variant="outline" className="px-3 py-1.5 bg-primary/10 border-primary/20 text-primary font-bold text-xs rounded-full">
            {getWarehouseDetails(selectedWarehouseId || "").code} - {getWarehouseDetails(selectedWarehouseId || "").name}
          </Badge>
        </div>
      </div>

      {/* Zone & Bin Selectors for selected Warehouse */}
      {selectedWarehouseId && (
        <div className="flex flex-wrap gap-4 items-center bg-background/25 backdrop-blur-sm p-3.5 rounded-2xl border border-white/5 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
              Filter by Zone:
            </span>
            <select
              value={selectedZoneId}
              onChange={(e) => {
                setSelectedZoneId(e.target.value)
                setSelectedBinId("All")
              }}
              className="h-8 px-2 rounded-lg border border-white/10 bg-background/50 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="All">All Zones</option>
              {zones
                .filter((z) => z.warehouseId === selectedWarehouseId)
                .map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
              Filter by Bin Location:
            </span>
            <select
              value={selectedBinId}
              onChange={(e) => setSelectedBinId(e.target.value)}
              className="h-8 px-2 rounded-lg border border-white/10 bg-background/50 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="All">All Bins</option>
              {binLocations
                .filter(
                  (b) =>
                    b.warehouseId === selectedWarehouseId &&
                    (selectedZoneId === "All" || b.zoneId === selectedZoneId)
                )
                .map((b) => (
                  <option key={b.id} value={b.code}>{b.code}</option>
                ))}
            </select>
          </div>
        </div>
      )}

      {/* Grid view of stock items with high fidelity cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredInventory.map((item) => {
          const prod = getProductDetails(item.productId)
          const wh = getWarehouseDetails(item.warehouseId)
          const expired = isExpired(item.expirationDate)
          const inspection = !expired && isInspectionDue(item.expirationDate)

          const binObj = binLocations.find(
            (b) => b.warehouseId === item.warehouseId && (b.code === item.binLocation || b.id === item.binLocation)
          )
          const zoneObj = binObj ? zones.find((z) => z.id === binObj.zoneId) : null

          return (
            <Card key={item.id} className="relative overflow-hidden border border-white/5 bg-background/30 backdrop-blur-md hover:bg-background/50 transition-all hover:shadow-md rounded-2xl">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs font-mono text-muted-foreground tracking-wider uppercase bg-muted/60 px-2 py-0.5 rounded-md">
                      {prod.sku}
                    </span>
                    <h3 className="font-bold text-base mt-2 line-clamp-1">
                      {prod.name}
                    </h3>
                  </div>
                  
                  {expired ? (
                    <Badge variant="destructive" className="rounded-full animate-pulse text-[10px] font-bold">Expired Cert</Badge>
                  ) : inspection ? (
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white rounded-full text-[10px] font-bold">Insp. Due</Badge>
                  ) : (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-[10px] font-bold">Active</Badge>
                  )}
                </div>

                <div className="space-y-2 text-sm text-foreground/80 mt-4">
                  <div className="flex justify-between border-b border-white/5 pb-1.5">
                    <span className="text-muted-foreground">Facility</span>
                    <span className="font-semibold">{wh.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1.5">
                    <span className="text-muted-foreground">Bin Location</span>
                    <span className="font-mono font-semibold text-primary">
                      {zoneObj ? `${zoneObj.name.split(" - ")[0]} / ` : ""}
                      {item.binLocation || "Unassigned"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1.5">
                    <span className="text-muted-foreground">Lot Serial</span>
                    <span className="font-mono font-semibold">{item.lotNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pressure/Cert Expiry</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {item.expirationDate || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 bg-muted/40 p-4 rounded-xl flex items-center justify-between border border-white/5">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider block">Quantity On Hand</span>
                    <span className="text-2xl font-black text-foreground">{item.quantityOnHand}</span>
                    <span className="text-xs text-muted-foreground ml-1">{prod.unitOfMeasure}s</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider block">Threshold</span>
                    <span className="text-xs font-semibold">Min: {prod.minLevel} {prod.unitOfMeasure}s</span>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}

        {filteredInventory.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground bg-background/20 rounded-2xl border border-dashed border-white/10">
            No bin stock items found matching your filters.
          </div>
        )}
      </div>
    </div>
  )
}
