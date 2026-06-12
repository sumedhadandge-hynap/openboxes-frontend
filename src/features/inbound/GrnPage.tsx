import { useState } from "react"
import { useWarehouseStore } from "@/store/useWarehouseStore"
import { CheckCircle, Truck, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface GrnInfoItem {
  productId: string
  quantityReceived: number
  lotNumber: string
  expirationDate: string
  binLocation: string
  name: string
  sku: string
}

interface LastGrnInfo {
  grnNumber: string
  shipmentNumber: string
  origin: string
  destination: string
  receivedDate: string
  items: GrnInfoItem[]
}

export function GrnPage() {
  const { shipments, products, warehouses, receiveShipment, zones, binLocations, selectedWarehouseId } = useWarehouseStore()
  const [selectedShipmentId, setSelectedShipmentId] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [lastGrnInfo, setLastGrnInfo] = useState<LastGrnInfo | null>(null)

  // Receiving state for each item in the selected shipment
  const [receivedQtyMap, setReceivedQtyMap] = useState<Record<string, number>>({})
  const [lotMap, setLotMap] = useState<Record<string, string>>({})
  const [expiryMap, setExpiryMap] = useState<Record<string, string>>({})
  const [binMap, setBinMap] = useState<Record<string, string>>({})

  const activeShipment = shipments.find((s) => s.id === selectedShipmentId)
  const inboundShipments = shipments.filter(
    (s) => s.type === "Inbound" && s.status !== "Received" && s.destination === selectedWarehouseId
  )

  const getProductDetails = (prodId: string) => {
    return products.find((p) => p.id === prodId) || { name: "Unknown Product", sku: "N/A" }
  }

  const getWarehouseDetails = (whId: string) => {
    return warehouses.find((w) => w.id === whId) || { name: "Unknown Facility" }
  }

  const handleSelectShipment = (id: string) => {
    setSelectedShipmentId(id)
    setIsSuccess(false)
    const shipment = shipments.find((s) => s.id === id)
    if (shipment) {
      const qMap: Record<string, number> = {}
      const lMap: Record<string, string> = {}
      const eMap: Record<string, string> = {}
      const bMap: Record<string, string> = {}
      
      const destWarehouseBins = binLocations.filter((b) => b.warehouseId === shipment.destination)
      const defaultBin = destWarehouseBins[0]?.code || "BIN-UNASSIGNED"

      shipment.items.forEach((it) => {
        qMap[it.productId] = it.quantityShipped
        lMap[it.productId] = it.lotNumber || `LOT-${new Date().getFullYear()}A`
        eMap[it.productId] = it.expirationDate || "2031-12-31"
        bMap[it.productId] = it.binLocation || defaultBin
      })
      
      setReceivedQtyMap(qMap)
      setLotMap(lMap)
      setExpiryMap(eMap)
      setBinMap(bMap)
    }
  }

  const handleQtyChange = (productId: string, val: number) => {
    setReceivedQtyMap({ ...receivedQtyMap, [productId]: Math.max(0, val) })
  }

  const handleLotChange = (productId: string, val: string) => {
    setLotMap({ ...lotMap, [productId]: val })
  }

  const handleExpiryChange = (productId: string, val: string) => {
    setExpiryMap({ ...expiryMap, [productId]: val })
  }

  const handleBinChange = (productId: string, val: string) => {
    setBinMap({ ...binMap, [productId]: val })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeShipment) return

    const receivedItems = activeShipment.items.map((it) => ({
      productId: it.productId,
      quantityReceived: Number(receivedQtyMap[it.productId] || 0),
      lotNumber: lotMap[it.productId] || "LOT-GENERIC",
      expirationDate: expiryMap[it.productId] || "",
      binLocation: binMap[it.productId] || "BIN-UNASSIGNED",
    }))

    receiveShipment(activeShipment.id, receivedItems)
    
    const hash = activeShipment.shipmentNumber.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    // Save info for printed slip
    setLastGrnInfo({
      grnNumber: `GRN-2026-${1000 + (hash * 13) % 9000}`,
      shipmentNumber: activeShipment.shipmentNumber,
      origin: activeShipment.origin,
      destination: getWarehouseDetails(activeShipment.destination).name,
      receivedDate: new Date().toISOString().split("T")[0],
      items: receivedItems.map(ri => ({
        ...ri,
        name: getProductDetails(ri.productId).name,
        sku: getProductDetails(ri.productId).sku,
      }))
    })

    setIsSuccess(true)
    setSelectedShipmentId("")
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
          Goods Received Note (GRN) Desk
        </h2>
        <p className="text-muted-foreground mt-0.5">
          Process inbound delivery arrivals, audit manufacturer counts, print GRN receipts, and log items to locations.
        </p>
      </div>

      {isSuccess && lastGrnInfo && (
        <Card className="border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-md rounded-2xl relative overflow-hidden p-6 animate-in zoom-in-95 duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle className="h-24 w-24 text-emerald-500" />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-500 font-bold">
                <CheckCircle className="h-5 w-5" />
                Inbound Shipment Logged & Audit Approved!
              </div>
              <h3 className="text-2xl font-black">{lastGrnInfo.grnNumber}</h3>
              <p className="text-sm text-muted-foreground">
                Inbound cargo associated with Shipment <strong>{lastGrnInfo.shipmentNumber}</strong> has been transferred into <strong>{lastGrnInfo.destination}</strong> inventory ledger.
              </p>
            </div>
            <Button variant="outline" className="rounded-xl shrink-0 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 font-bold" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" /> Print GRN Slip
            </Button>
          </div>

          {/* Mini receipt detail */}
          <div className="mt-6 border-t border-dashed border-emerald-500/20 pt-4 text-xs space-y-2 max-w-lg">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Supplier/Carrier:</span>
              <span className="font-semibold">{lastGrnInfo.origin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Logistics Date:</span>
              <span className="font-semibold">{lastGrnInfo.receivedDate}</span>
            </div>
            <div className="space-y-1 mt-3">
              <span className="font-bold text-muted-foreground block border-b border-emerald-500/10 pb-1 uppercase tracking-wider">Audit Quantities</span>
              {lastGrnInfo.items.map((item, idx: number) => (
                <div key={idx} className="flex justify-between font-mono">
                  <span>{item.name} ({item.sku})</span>
                  <span className="font-bold">{item.quantityReceived} units @ {item.binLocation} (Lot: {item.lotNumber})</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-7">
        {/* Left pane - select shipment */}
        <Card className="md:col-span-3 border-0 bg-background/30 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Unreceived Deliveries</CardTitle>
            <CardDescription>Select an active inbound shipment en-route to begin inspection.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {inboundShipments.map((s) => (
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
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="font-mono text-sm font-bold">{s.shipmentNumber}</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                    From: <span className="font-semibold text-foreground/80">{s.origin}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Destination: <span className="font-semibold">{getWarehouseDetails(s.destination).name}</span>
                  </div>
                </div>
                <Badge className="rounded-full text-[10px] font-bold uppercase">{s.status}</Badge>
              </div>
            ))}

            {inboundShipments.length === 0 && (
              <div className="p-12 text-center text-muted-foreground bg-background/10 rounded-2xl italic text-sm">
                No active inbound shipments waiting. Try creating one in settings or POs.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right pane - Receipt Audit Form */}
        <Card className="md:col-span-4 border-0 bg-background/30 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden relative">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Inbound Audit Worksheet</CardTitle>
            <CardDescription>Fill in physical counts, verify certificate lot serials, and map bin allocations.</CardDescription>
          </CardHeader>
          <CardContent>
            {activeShipment ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 border border-white/5">
                  <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Shipment Manifest Details</div>
                  <div className="flex justify-between text-xs text-foreground/80">
                    <span>Carrier: <strong className="text-foreground">{activeShipment.carrier || "N/A"}</strong></span>
                    <span>Tracking No: <strong className="text-foreground">{activeShipment.trackingNumber || "N/A"}</strong></span>
                    <span>Shipped: <strong className="text-foreground">{activeShipment.shippedDate}</strong></span>
                  </div>
                </div>

                <div className="space-y-4">
                  {activeShipment.items.map((item) => {
                    const prod = getProductDetails(item.productId)
                    return (
                      <div key={item.productId} className="p-4 rounded-2xl border border-white/5 bg-background/40 space-y-3">
                        <div className="flex items-start justify-between border-b border-white/5 pb-2">
                          <div>
                            <span className="font-mono text-xs text-muted-foreground">{prod.sku}</span>
                            <div className="font-bold text-sm text-foreground/95">{prod.name}</div>
                          </div>
                          <Badge variant="outline" className="text-xs rounded-md">
                            Shipped Qty: {item.quantityShipped}
                          </Badge>
                        </div>

                        {/* Audit Details */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Received Qty</Label>
                            <Input
                              type="number"
                              value={receivedQtyMap[item.productId] ?? item.quantityShipped}
                              onChange={(e) => handleQtyChange(item.productId, Number(e.target.value))}
                              min={0}
                              className="h-8 text-xs rounded-lg"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Lot Serial Code *</Label>
                            <Input
                              value={lotMap[item.productId] ?? ""}
                              onChange={(e) => handleLotChange(item.productId, e.target.value)}
                              className="h-8 text-xs rounded-lg font-mono font-semibold"
                              placeholder="e.g. LOT-2026A"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Cert Expiration</Label>
                            <Input
                              type="date"
                              value={expiryMap[item.productId] ?? ""}
                              onChange={(e) => handleExpiryChange(item.productId, e.target.value)}
                              className="h-8 text-xs rounded-lg"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Putaway Bin Location *</Label>
                            <select
                              value={binMap[item.productId] ?? ""}
                              onChange={(e) => handleBinChange(item.productId, e.target.value)}
                              className="w-full h-8 px-2 rounded-lg border border-input bg-background/50 text-xs focus:outline-none focus:ring-1 focus:ring-ring focus:bg-background font-semibold"
                              required
                            >
                              <option value="">Select Bin Location</option>
                              {zones
                                .filter((z) => z.warehouseId === activeShipment.destination)
                                .map((z) => {
                                  const zoneBins = binLocations.filter(
                                    (b) => b.warehouseId === activeShipment.destination && b.zoneId === z.id
                                  )
                                  if (zoneBins.length === 0) return null
                                  return (
                                    <optgroup key={z.id} label={z.name}>
                                      {zoneBins.map((b) => (
                                        <option key={b.id} value={b.code}>
                                          {b.code}
                                        </option>
                                      ))}
                                    </optgroup>
                                  )
                                })}
                              {binLocations.filter((b) => b.warehouseId === activeShipment.destination).length === 0 && (
                                <option value="BIN-UNASSIGNED">BIN-UNASSIGNED (No Bins Configured)</option>
                              )}
                            </select>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex justify-end pt-4 border-t border-white/5">
                  <Button type="submit" className="rounded-xl font-bold shadow-lg shadow-primary/20">
                    Complete Log & Generate GRN
                  </Button>
                </div>
              </form>
            ) : (
              <div className="py-20 text-center text-muted-foreground bg-background/10 rounded-2xl italic text-sm">
                No Delivery Selected. Choose a shipment from the side pane to begin auditing.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
