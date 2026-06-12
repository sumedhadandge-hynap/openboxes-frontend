import { useParams, Link } from "react-router-dom"
import { useWarehouseStore } from "@/store/useWarehouseStore"
import { ArrowLeft, Warehouse as WarehouseIcon, User, MapPin, Box, ArrowUpRight, ArrowDownRight, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function WarehouseDetail() {
  const { id } = useParams<{ id: string }>()
  const { warehouses, inventory, products, shipments } = useWarehouseStore()

  const warehouse = warehouses.find((w) => w.id === id)

  if (!warehouse) {
    return (
      <div className="text-center py-12 space-y-4 animate-in fade-in duration-500">
        <h3 className="text-xl font-bold text-muted-foreground">Facility Not Found</h3>
        <Link to="/warehouses">
          <Button variant="outline" className="rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Facilities
          </Button>
        </Link>
      </div>
    )
  }

  // Calculate items and stock count inside this warehouse
  const whInventory = inventory.filter((item) => item.warehouseId === warehouse.id)
  const totalStockCount = whInventory.reduce((sum, item) => sum + item.quantityOnHand, 0)
  const uniqueSKUsCount = new Set(whInventory.map((item) => item.productId)).size

  // Get recent shipments associated with this warehouse
  const relatedShipments = shipments.filter(
    (s) => s.destination === warehouse.id || s.origin === warehouse.id
  )

  const getProductDetails = (prodId: string) => {
    return products.find((p) => p.id === prodId) || { name: "Unknown Product", sku: "N/A", unitOfMeasure: "Units" }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link to="/warehouses">
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
              {warehouse.name}
            </h2>
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 rounded-md font-mono font-bold">
              {warehouse.code}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5">
            Detailed storage capacity, physical assets ledger, and freight tracking log.
          </p>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border border-white/5 bg-background/20 backdrop-blur-sm p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-primary/10 text-primary rounded-xl shrink-0">
            <WarehouseIcon className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Facility Type</span>
            <span className="text-lg font-extrabold text-foreground">{warehouse.type}</span>
          </div>
        </Card>

        <Card className="border border-white/5 bg-background/20 backdrop-blur-sm p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-blue-500/10 text-blue-500 rounded-xl shrink-0">
            <Box className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Total Quantities</span>
            <span className="text-lg font-extrabold text-foreground">{totalStockCount} units</span>
          </div>
        </Card>

        <Card className="border border-white/5 bg-background/20 backdrop-blur-sm p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Unique SKUs</span>
            <span className="text-lg font-extrabold text-foreground">{uniqueSKUsCount} Items</span>
          </div>
        </Card>

        <Card className="border border-white/5 bg-background/20 backdrop-blur-sm p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-purple-500/10 text-purple-500 rounded-xl shrink-0">
            <User className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Warehouse Manager</span>
            <span className="text-lg font-extrabold text-foreground">{warehouse.manager}</span>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Physical Stock breakdown */}
        <Card className="col-span-4 border-0 bg-background/30 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Physical Stock Ledgers</CardTitle>
            <CardDescription>All safety hardware, alarms, and suppression gases physically sitting in this warehouse.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] text-muted-foreground uppercase font-bold bg-background/20">
                    <th className="p-3 pl-6">Product Item</th>
                    <th className="p-3">Lot Code</th>
                    <th className="p-3">Bin Location</th>
                    <th className="p-3 text-right pr-6">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {whInventory.map((item) => {
                    const prod = getProductDetails(item.productId)
                    return (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 pl-6">
                          <div>
                            <span className="font-mono text-[10px] text-muted-foreground font-bold">{prod.sku}</span>
                            <div className="font-bold text-foreground mt-0.5">{prod.name}</div>
                          </div>
                        </td>
                        <td className="p-3 font-mono font-semibold text-muted-foreground">{item.lotNumber}</td>
                        <td className="p-3 font-semibold text-primary">{item.binLocation || "Unassigned"}</td>
                        <td className="p-3 text-right pr-6 font-black text-foreground">
                          {item.quantityOnHand} <span className="text-[10px] text-muted-foreground font-normal">{prod.unitOfMeasure}s</span>
                        </td>
                      </tr>
                    )
                  })}
                  {whInventory.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-muted-foreground italic">
                        This warehouse is currently empty.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Warehouse Cargo Logs and details */}
        <div className="col-span-3 space-y-6">
          {/* Facility Location Details */}
          <Card className="border-0 bg-background/30 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden p-6 space-y-4">
            <h3 className="font-bold text-lg text-foreground">Depot Operations</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Physical Address</span>
                  <span className="text-foreground/90 leading-snug">{warehouse.location}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-white/5 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Storage Capacity Utilization</span>
                  <span className="text-sm font-bold text-primary">{warehouse.capacity}%</span>
                </div>
                <div className="h-3.5 w-full bg-muted overflow-hidden rounded-full p-0.5 border border-white/5">
                  <div
                    style={{ width: `${warehouse.capacity}%` }}
                    className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Deliveries */}
          <Card className="border-0 bg-background/30 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Recent Logistics Shipments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {relatedShipments.slice(0, 3).map((s) => {
                const isInbound = s.destination === warehouse.id
                return (
                  <div key={s.id} className="p-3 rounded-xl bg-background/40 hover:bg-background/60 border border-white/5 transition-all flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        {isInbound ? (
                          <ArrowDownRight className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-blue-500 shrink-0" />
                        )}
                        <span className="font-mono font-black">{s.shipmentNumber}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {isInbound ? `Inbound putaway from: ${s.origin}` : `Outbound pick to: ${s.destination}`}
                      </div>
                    </div>

                    <Badge className="rounded-full text-[9px] font-bold uppercase" variant={s.status === "Received" ? "default" : "secondary"}>
                      {s.status}
                    </Badge>
                  </div>
                )
              })}

              {relatedShipments.length === 0 && (
                <div className="p-6 text-center text-muted-foreground italic text-xs">
                  No active shipment logs registered for this depot.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
