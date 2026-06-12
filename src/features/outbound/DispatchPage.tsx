import { useState } from "react"
import { useWarehouseStore } from "@/store/useWarehouseStore"
import { CheckCircle2, ClipboardList, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export function DispatchPage() {
  const { shipments, products, warehouses, inventory, pickPackShipOutbound, zones, binLocations, selectedWarehouseId } = useWarehouseStore()
  const [selectedShipmentId, setSelectedShipmentId] = useState("")
  
  // Shipping carrier inputs
  const [carrier, setCarrier] = useState("Blue Dart")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Picking details state
  const [pickedItemsMap, setPickedItemsMap] = useState<Record<string, { lotNumber: string; binLocation: string; quantity: number }[]>>({})

  const activeShipment = shipments.find((s) => s.id === selectedShipmentId)
  const outboundShipments = shipments.filter(
    (s) => s.type === "Outbound" && s.status === "Draft" && s.origin === selectedWarehouseId
  )

  const getProductDetails = (prodId: string) => {
    return products.find((p) => p.id === prodId) || { name: "Unknown Product", sku: "N/A" }
  }

  const getWarehouseDetails = (whId: string) => {
    return warehouses.find((w) => w.id === whId) || { name: "Unknown Facility", code: "N/A" }
  }

  // Find where a product currently has stock in the warehouse
  const getProductStockLocations = (productId: string, warehouseId: string) => {
    return inventory.filter((item) => item.productId === productId && item.warehouseId === warehouseId)
  }

  const handleSelectShipment = (id: string) => {
    setSelectedShipmentId(id)
    setIsSuccess(false)
    setCarrier("Blue Dart")
    const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    setTrackingNumber(`TRK-OUT-${100000 + (hash * 17) % 900000}`)

    const shipment = shipments.find((s) => s.id === id)
    if (shipment) {
      const pMap: Record<string, { lotNumber: string; binLocation: string; quantity: number }[]> = {}
      
      shipment.items.forEach((it) => {
        // Find first available inventory item to autofill picking source
        const stockItems = getProductStockLocations(it.productId, shipment.origin)
        if (stockItems.length > 0) {
          pMap[it.productId] = [{
            lotNumber: stockItems[0].lotNumber,
            binLocation: stockItems[0].binLocation,
            quantity: Math.min(it.quantityShipped, stockItems[0].quantityOnHand)
          }]
        } else {
          pMap[it.productId] = [{
            lotNumber: "NO-ACTIVE-LOT",
            binLocation: "NO-ACTIVE-BIN",
            quantity: it.quantityShipped
          }]
        }
      })
      
      setPickedItemsMap(pMap)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeShipment) return

    setIsSubmitting(true)

    // Flatten packed items structure
    const packedItems = activeShipment.items.flatMap((it) => {
      const items = pickedItemsMap[it.productId] || []
      return items.map((pi) => ({
        productId: it.productId,
        lotNumber: pi.lotNumber,
        binLocation: pi.binLocation,
        quantity: pi.quantity,
      }))
    })

    setTimeout(() => {
      pickPackShipOutbound(activeShipment.id, carrier, trackingNumber, packedItems)
      setIsSubmitting(false)
      setIsSuccess(true)
      setSelectedShipmentId("")
    }, 1200)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
          Picking & Dispatch Control
        </h2>
        <p className="text-muted-foreground mt-0.5">
          Process material dispatch tickets, complete physical shelf picking audits, and coordinate project shipments.
        </p>
      </div>

      {isSuccess && (
        <Card className="border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-md rounded-2xl relative overflow-hidden p-6 animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2 text-emerald-500 font-bold mb-1">
            <CheckCircle2 className="h-5 w-5" />
            Outbound Cargo Dispatched!
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">
            Stock quantities have been successfully deducted from the source facility. Courier tracking documents generated and dispatched.
          </p>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-7">
        {/* Left pane - Pending Dispatches */}
        <Card className="md:col-span-3 border-0 bg-background/30 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Pending Dispatch Tickets</CardTitle>
            <CardDescription>Select a draft outbound shipment to initiate physical warehouse picking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {outboundShipments.map((s) => {
              const totalItems = s.items.reduce((sum, item) => sum + item.quantityShipped, 0)
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelectShipment(s.id)}
                  className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-center justify-between ${
                    selectedShipmentId === s.id
                      ? "bg-primary/10 border-primary text-primary shadow-sm"
                      : "bg-background/40 hover:bg-background/80 border-white/5"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-primary" />
                      <span className="font-mono text-sm font-bold">{s.shipmentNumber}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Origin Facility: <strong className="text-foreground/80">{getWarehouseDetails(s.origin).name}</strong>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Destination Project: <strong className="text-foreground/80">{s.destination}</strong>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <Badge className="rounded-full text-[10px] font-bold bg-primary/20 text-primary hover:bg-primary/30">{s.status}</Badge>
                    <span className="text-xs font-semibold text-muted-foreground">{totalItems} Units</span>
                  </div>
                </div>
              )
            })}

            {outboundShipments.length === 0 && (
              <div className="p-12 text-center text-muted-foreground bg-background/10 rounded-2xl italic text-sm">
                No active picking/dispatch tickets pending. Complete a requisition to trigger one.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right pane - Picking Worksheet */}
        <Card className="md:col-span-4 border-0 bg-background/30 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Outbound Shipping Invoice & Picker</CardTitle>
            <CardDescription>Verify bin storage coordinates, allocate lot serial batches, and input courier tracking.</CardDescription>
          </CardHeader>
          <CardContent>
            {activeShipment ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="carrier" className="text-xs font-semibold">Logistics Carrier *</Label>
                    <select
                      id="carrier"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="Blue Dart">Blue Dart Express</option>
                      <option value="DHL Express">DHL Express</option>
                      <option value="V-Trans Logistics">V-Trans Logistics</option>
                      <option value="Self Pickup">Self Pickup by Project Rep</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="tracking" className="text-xs font-semibold">Waybill / Tracking No *</Label>
                    <Input
                      id="tracking"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="rounded-xl bg-background/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block border-b border-white/5 pb-2">Picking Directives</span>
                  {activeShipment.items.map((item) => {
                    const prod = getProductDetails(item.productId)
                    const stockItems = getProductStockLocations(item.productId, activeShipment.origin)
                    const pickedArray = pickedItemsMap[item.productId] || []

                    return (
                      <div key={item.productId} className="p-4 rounded-2xl border border-white/5 bg-background/40 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-mono text-xs text-muted-foreground">{prod.sku}</span>
                            <div className="font-bold text-sm text-foreground">{prod.name}</div>
                          </div>
                          <Badge variant="outline" className="rounded-md">
                            Requested Qty: {item.quantityShipped}
                          </Badge>
                        </div>

                        {/* Inventory recommendations */}
                        <div className="text-xs space-y-1 bg-muted/40 p-2.5 rounded-xl border border-white/5">
                          <span className="font-bold text-muted-foreground block text-[10px] uppercase">Available Shelf Stock in {getWarehouseDetails(activeShipment.origin).code}:</span>
                          {stockItems.length > 0 ? (
                            stockItems.map((st, sIdx) => {
                              const binObj = binLocations.find(
                                (b) => b.warehouseId === activeShipment.origin && (b.code === st.binLocation || b.id === st.binLocation)
                              )
                              const zoneObj = binObj ? zones.find((z) => z.id === binObj.zoneId) : null
                              return (
                                <div key={sIdx} className="flex justify-between font-mono text-foreground/80">
                                  <span>Bin: {st.binLocation} {zoneObj ? `(${zoneObj.name.split(" - ")[0]})` : ""} | Lot: {st.lotNumber}</span>
                                  <span>Qty Available: <strong>{st.quantityOnHand}</strong></span>
                                </div>
                              )
                            })
                          ) : (
                            <span className="text-rose-500 font-bold block animate-pulse">CRITICAL: Insufficient stock at warehouse!</span>
                          )}
                        </div>

                        {/* Pick Allocator */}
                        {pickedArray.map((p, pIdx) => (
                          <div key={pIdx} className="grid grid-cols-3 gap-2 text-xs pt-2">
                            <div className="col-span-2 space-y-1">
                              <Label className="text-[10px] text-muted-foreground">Source Batch (Lot & Bin Location) *</Label>
                              {stockItems.length > 0 ? (
                                <select
                                  value={`${p.lotNumber}:::${p.binLocation}`}
                                  onChange={(e) => {
                                    const [lot, bin] = e.target.value.split(":::")
                                    const updated = [...pickedArray]
                                    updated[pIdx].lotNumber = lot
                                    updated[pIdx].binLocation = bin
                                    const stItem = stockItems.find((s) => s.lotNumber === lot && s.binLocation === bin)
                                    const maxAvail = stItem ? stItem.quantityOnHand : 1
                                    updated[pIdx].quantity = Math.min(p.quantity, maxAvail, item.quantityShipped)
                                    setPickedItemsMap({ ...pickedItemsMap, [item.productId]: updated })
                                  }}
                                  className="w-full h-8 px-2 rounded-lg border border-input bg-background/50 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-mono font-semibold"
                                >
                                  {stockItems.map((st, stIdx) => {
                                    const binObj = binLocations.find(
                                      (b) => b.warehouseId === activeShipment.origin && (b.code === st.binLocation || b.id === st.binLocation)
                                    )
                                    const zoneObj = binObj ? zones.find((z) => z.id === binObj.zoneId) : null
                                    return (
                                      <option key={stIdx} value={`${st.lotNumber}:::${st.binLocation}`}>
                                        Lot: {st.lotNumber} | Bin: {st.binLocation} {zoneObj ? `(${zoneObj.name.split(" - ")[0]})` : ""} ({st.quantityOnHand} avail)
                                      </option>
                                    )
                                  })}
                                </select>
                              ) : (
                                <Input
                                  value="No Stock Available"
                                  disabled
                                  className="h-8 text-xs font-semibold text-rose-500 bg-rose-500/10 border-rose-500/20 rounded-lg"
                                />
                              )}
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground">Pick Qty</Label>
                              <Input
                                type="number"
                                value={p.quantity}
                                onChange={(e) => {
                                  const val = Number(e.target.value)
                                  const updated = [...pickedArray]
                                  const stItem = stockItems.find((s) => s.lotNumber === p.lotNumber && s.binLocation === p.binLocation)
                                  const maxAvail = stItem ? stItem.quantityOnHand : 999999
                                  updated[pIdx].quantity = Math.max(1, Math.min(val, maxAvail, item.quantityShipped))
                                  setPickedItemsMap({ ...pickedItemsMap, [item.productId]: updated })
                                }}
                                className="h-8 text-xs rounded-lg font-bold"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>

                <div className="flex justify-end pt-4 border-t border-white/5">
                  <Button type="submit" disabled={isSubmitting} className="rounded-xl font-bold shadow-lg shadow-primary/20">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing Shipping Labels...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Dispatch Shipment
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="py-20 text-center text-muted-foreground bg-background/10 rounded-2xl italic text-sm">
                No outbound ticket selected. Choose a pending delivery invoice from the list.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
