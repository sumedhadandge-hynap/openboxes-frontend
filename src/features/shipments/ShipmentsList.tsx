import { useState } from "react"
import { Link } from "react-router-dom"
import { useWarehouseStore, type Shipment, type ShipmentItem } from "@/store/useWarehouseStore"
import { Search, Plus, Truck, Calendar, Eye, ArrowDownLeft, ArrowUpRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export function ShipmentsList({ defaultType }: { defaultType?: "Inbound" | "Outbound" }) {
  const { shipments, warehouses, products, createShipment, selectedWarehouseId } = useWarehouseStore()
  const [activeTab, setActiveTab] = useState<"Inbound" | "Outbound">(defaultType || "Inbound")
  const [searchTerm, setSearchTerm] = useState("")
  
  // Dialog state
  const [isOpen, setIsOpen] = useState(false)
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [carrier, setCarrier] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  
  // Dynamic shipment items
  const [shipmentItems, setShipmentItems] = useState<{ productId: string; quantity: number; lotNumber: string; expirationDate: string }[]>([
    { productId: products[0]?.id || "", quantity: 10, lotNumber: "", expirationDate: "" }
  ])

  const getWarehouseName = (whId: string) => {
    const wh = warehouses.find((w) => w.id === whId)
    return wh ? `${wh.name} (${wh.code})` : whId
  }


  const handleAddRow = () => {
    setShipmentItems([
      ...shipmentItems,
      { productId: products[0]?.id || "", quantity: 10, lotNumber: "", expirationDate: "" }
    ])
  }

  const handleRemoveRow = (index: number) => {
    if (shipmentItems.length === 1) return
    setShipmentItems(shipmentItems.filter((_, idx) => idx !== index))
  }

  const handleRowChange = (index: number, field: string, value: string | number) => {
    const updated = [...shipmentItems]
    updated[index] = { ...updated[index], [field]: value }
    setShipmentItems(updated)
  }

  const openCreateDialog = () => {
    setOrigin(activeTab === "Inbound" ? "" : selectedWarehouseId || warehouses[0]?.id || "")
    setDestination(activeTab === "Inbound" ? selectedWarehouseId || warehouses[0]?.id || "" : "")
    setCarrier("")
    setTrackingNumber("")
    setShipmentItems([{ productId: products[0]?.id || "", quantity: 10, lotNumber: "", expirationDate: "" }])
    setIsOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!origin || !destination) return

    const items: ShipmentItem[] = shipmentItems.map((item) => ({
      productId: item.productId,
      quantityShipped: Number(item.quantity),
      quantityReceived: 0,
      lotNumber: item.lotNumber || "LOT-DEFAULT",
      expirationDate: item.expirationDate,
    }))

    createShipment({
      type: activeTab,
      origin,
      destination,
      status: "Shipped", // Pre-shipped for convenience in mock flows
      carrier,
      trackingNumber,
      shippedDate: new Date().toISOString().split("T")[0],
      items,
    })

    setIsOpen(false)
  }

  // Filter shipments
  const filteredShipments = shipments.filter((s) => {
    if (s.type !== activeTab) return false
    const matchesWh = activeTab === "Inbound" ? s.destination === selectedWarehouseId : s.origin === selectedWarehouseId
    const matchesSearch =
      s.shipmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.destination.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesWh && matchesSearch
  })

  // Status Styling helper
  const getStatusBadge = (status: Shipment["status"]) => {
    switch (status) {
      case "Draft":
        return <Badge variant="secondary" className="rounded-full">Draft</Badge>
      case "Shipped":
        return <Badge className="bg-sky-500 text-white rounded-full hover:bg-sky-600">Shipped</Badge>
      case "Receiving":
        return <Badge className="bg-amber-500 text-white rounded-full hover:bg-amber-600 animate-pulse">Receiving</Badge>
      case "Received":
        return <Badge className="bg-emerald-500 text-white rounded-full hover:bg-emerald-600">Received</Badge>
      case "Partial":
        return <Badge className="bg-indigo-500 text-white rounded-full hover:bg-indigo-600">Partial Received</Badge>
      case "Cancelled":
        return <Badge variant="destructive" className="rounded-full">Cancelled</Badge>
      default:
        return <Badge className="rounded-full">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
            Logistics & Shipments
          </h2>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Dispatch stock to locations (Outbound) and receive supplier deliveries (Inbound).
          </p>
        </div>
        <Button onClick={openCreateDialog} className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary/20 shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Create {activeTab} Shipment
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-white/5 gap-6">
        <button
          onClick={() => {
            setActiveTab("Inbound")
            setSearchTerm("")
          }}
          className={`pb-3 text-base font-bold transition-all relative ${
            activeTab === "Inbound" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-2">
            <ArrowDownLeft className="h-5 w-5" /> Inbound Shipments
          </span>
          {activeTab === "Inbound" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab("Outbound")
            setSearchTerm("")
          }}
          className={`pb-3 text-base font-bold transition-all relative ${
            activeTab === "Outbound" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5" /> Outbound Shipments
          </span>
          {activeTab === "Outbound" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-background/40 backdrop-blur-sm p-4 rounded-2xl border border-white/5 shadow-sm">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${activeTab.toLowerCase()} shipments...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background/50 rounded-xl"
          />
        </div>
      </div>

      {/* Shipment Table */}
      <div className="rounded-2xl border border-white/5 bg-background/30 backdrop-blur-md overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse hidden md:table">
            <thead>
              <tr className="border-b border-white/10 text-xs text-muted-foreground uppercase tracking-wider bg-background/20">
                <th className="p-4 font-semibold">Shipment #</th>
                <th className="p-4 font-semibold">Origin</th>
                <th className="p-4 font-semibold">Destination</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Shipped Date</th>
                <th className="p-4 font-semibold">Received Date</th>
                <th className="p-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredShipments.map((shipment) => {
                const totalItemsCount = shipment.items.reduce((sum, item) => sum + item.quantityShipped, 0)
                
                return (
                  <tr key={shipment.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-primary shrink-0" />
                        <Link to={`/shipments/${shipment.id}`} className="hover:text-primary hover:underline transition-colors">
                          {shipment.shipmentNumber}
                        </Link>
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground block mt-0.5 ml-6">
                        {totalItemsCount} units total
                      </span>
                    </td>
                    <td className="p-4 font-semibold">
                      {shipment.type === "Inbound" ? (
                        <span className="text-foreground/80">{shipment.origin}</span>
                      ) : (
                        <span className="text-primary">{getWarehouseName(shipment.origin)}</span>
                      )}
                    </td>
                    <td className="p-4 font-semibold">
                      {shipment.type === "Inbound" ? (
                        <span className="text-primary">{getWarehouseName(shipment.destination)}</span>
                      ) : (
                        <span className="text-foreground/80">{shipment.destination}</span>
                      )}
                    </td>
                    <td className="p-4">{getStatusBadge(shipment.status)}</td>
                    <td className="p-4 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{shipment.shippedDate || "Draft"}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {shipment.receivedDate ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-emerald-500 font-semibold">{shipment.receivedDate}</span>
                        </div>
                      ) : (
                        <span className="text-xs italic text-muted-foreground/60">Not Received</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <Link to={`/shipments/${shipment.id}`}>
                        <Button variant="outline" size="sm" className="rounded-lg h-9 border-white/10">
                          <Eye className="h-4 w-4 mr-1.5" /> Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )
              })}

              {filteredShipments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground bg-background/10">
                    No {activeTab.toLowerCase()} shipments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile / Tablet Grid View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:hidden">
            {filteredShipments.map((shipment) => {
              const totalItemsCount = shipment.items.reduce((sum, item) => sum + item.quantityShipped, 0)
              
              return (
                <div key={shipment.id} className="bg-background/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3 transition-colors hover:bg-white/5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Truck className="h-4 w-4 text-primary shrink-0" />
                        <Link to={`/shipments/${shipment.id}`} className="font-bold text-foreground hover:text-primary hover:underline transition-colors">
                          {shipment.shipmentNumber}
                        </Link>
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground block">
                        {totalItemsCount} units total
                      </span>
                    </div>
                    <div className="shrink-0 ml-2">
                      {getStatusBadge(shipment.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-y border-white/5 py-2 my-1">
                    <div className="min-w-0 pr-1">
                      <div className="text-muted-foreground mb-1">Origin</div>
                      <div className="font-semibold truncate">
                        {shipment.type === "Inbound" ? (
                          <span className="text-foreground/80">{shipment.origin}</span>
                        ) : (
                          <span className="text-primary">{getWarehouseName(shipment.origin)}</span>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 pr-1">
                      <div className="text-muted-foreground mb-1">Destination</div>
                      <div className="font-semibold truncate">
                        {shipment.type === "Inbound" ? (
                          <span className="text-primary">{getWarehouseName(shipment.destination)}</span>
                        ) : (
                          <span className="text-foreground/80">{shipment.destination}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>Ship: {shipment.shippedDate || "Draft"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className={`h-3 w-3 shrink-0 ${shipment.receivedDate ? 'text-emerald-500' : 'text-muted-foreground/60'}`} />
                        {shipment.receivedDate ? (
                          <span className="text-emerald-500 font-semibold">Recv: {shipment.receivedDate}</span>
                        ) : (
                          <span className="text-muted-foreground/60 italic">Not Received</span>
                        )}
                      </div>
                    </div>
                    <Link to={`/shipments/${shipment.id}`}>
                      <Button variant="outline" size="sm" className="rounded-lg h-8 border-white/10 shrink-0">
                        <Eye className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
            
            {filteredShipments.length === 0 && (
              <div className="col-span-full py-8 text-center text-muted-foreground bg-background/10 rounded-xl">
                No {activeTab.toLowerCase()} shipments found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Shipment Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto rounded-3xl border-white/10 glass-card">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Create {activeTab} Shipment
              </DialogTitle>
              <DialogDescription>
                Initiate a new shipment, add items, lot identifiers, and quantities.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="shipOrigin">
                    {activeTab === "Inbound" ? "Supplier Name (Origin) *" : "Source Facility (Origin) *"}
                  </Label>
                  {activeTab === "Inbound" ? (
                    <Input
                      id="shipOrigin"
                      placeholder="e.g. Siemens India Ltd."
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  ) : (
                    <select
                      id="shipOrigin"
                      value={origin}
                      disabled
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-not-allowed opacity-70"
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="shipDest">
                    {activeTab === "Inbound" ? "Destination Facility *" : "Destination Customer/Project Site *"}
                  </Label>
                  {activeTab === "Inbound" ? (
                    <select
                      id="shipDest"
                      value={destination}
                      disabled
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-not-allowed opacity-70"
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id="shipDest"
                      placeholder="e.g. Mumbai Metro Project Site"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="carrier">Logistics Carrier</Label>
                  <Input
                    id="carrier"
                    placeholder="e.g. DHL Express, FedEx"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tracking">Tracking Code</Label>
                  <Input
                    id="tracking"
                    placeholder="e.g. DHL9804294"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-sm font-bold text-foreground">Shipment Invoice Items</span>
                  <Button type="button" size="sm" variant="ghost" onClick={handleAddRow} className="text-primary hover:bg-primary/10 h-8">
                    <Plus className="h-4 w-4 mr-1" /> Add Row
                  </Button>
                </div>

                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                  {shipmentItems.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:items-end bg-muted/20 p-2.5 rounded-xl border border-white/5">
                      <div className="flex-1 space-y-1 w-full">
                        <Label className="text-[10px] text-muted-foreground uppercase font-bold">Select Product</Label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleRowChange(idx, "productId", e.target.value)}
                          className="w-full h-9 px-2 rounded-lg border border-input bg-background/50 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full sm:w-20 space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase font-bold">Quantity</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleRowChange(idx, "quantity", Number(e.target.value))}
                          min={1}
                          className="h-9 px-2 rounded-lg text-xs"
                        />
                      </div>

                      {activeTab === "Inbound" && (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <div className="flex-1 sm:w-28 space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase font-bold">Lot #</Label>
                            <Input
                              placeholder="Lot Code"
                              value={item.lotNumber}
                              onChange={(e) => handleRowChange(idx, "lotNumber", e.target.value)}
                              className="h-9 px-2 rounded-lg text-xs font-mono"
                            />
                          </div>
                          <div className="flex-1 sm:w-28 space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase font-bold">Expiry Date</Label>
                            <Input
                              type="date"
                              value={item.expirationDate}
                              onChange={(e) => handleRowChange(idx, "expirationDate", e.target.value)}
                              className="h-9 px-2 rounded-lg text-xs"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end w-full sm:w-auto mt-2 sm:mt-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRow(idx)}
                          disabled={shipmentItems.length === 1}
                          className="h-9 w-9 text-rose-500 hover:bg-rose-500/10 rounded-lg shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4 border-t border-white/5 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl w-full sm:w-auto">
                Dispatch Shipment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
