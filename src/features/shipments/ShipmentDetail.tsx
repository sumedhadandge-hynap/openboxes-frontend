import { useParams, Link } from "react-router-dom"
import { useWarehouseStore } from "@/store/useWarehouseStore"
import { ArrowLeft, Calendar, FileText, MapPin, Truck, CheckCircle2, Package, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ShipmentDetail() {
  const { id } = useParams<{ id: string }>()
  const { shipments, warehouses, products } = useWarehouseStore()

  const shipment = shipments.find((s) => s.id === id)
  if (!shipment) {
    return (
      <div className="p-12 text-center">
        <h3 className="text-xl font-bold">Shipment Not Found</h3>
        <p className="text-muted-foreground mt-2">The requested shipment could not be found.</p>
        <Link to="/shipments" className="mt-4 inline-block text-primary hover:underline">
          Back to Shipments
        </Link>
      </div>
    )
  }

  const getWarehouseName = (whId: string) => {
    const wh = warehouses.find((w) => w.id === whId)
    return wh ? `${wh.name} (${wh.code})` : whId
  }

  const getProductDetails = (prodId: string) => {
    return products.find((p) => p.id === prodId) || { name: prodId, sku: "N/A", unitOfMeasure: "Units" }
  }

  // Determine timeline steps
  const steps = [
    { label: "Drafted", date: shipment.shippedDate ? "Completed" : "Active", done: true },
    { label: "Shipped", date: shipment.shippedDate || "Pending", done: !!shipment.shippedDate },
    {
      label: "Received",
      date: shipment.receivedDate || (shipment.status === "Partial" ? "Partial" : "Pending"),
      done: shipment.status === "Received" || shipment.status === "Partial",
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Link to="/shipments" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Shipments
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono bg-muted px-2.5 py-1 rounded-lg text-muted-foreground border border-white/5 font-semibold">
                {shipment.shipmentNumber}
              </span>
              <Badge
                className={
                  shipment.status === "Received"
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : shipment.status === "Shipped"
                    ? "bg-sky-500 hover:bg-sky-600 text-white"
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                }
              >
                {shipment.status}
              </Badge>
              <Badge variant="outline" className="rounded-full">
                {shipment.type} Logistics
              </Badge>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mt-2">
              {shipment.type === "Inbound" ? "Supplier Delivery Receipt" : "Outbound Dispatch Route"}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            {shipment.type === "Inbound" && (shipment.status === "Shipped" || shipment.status === "Draft") && (
              <Link to={`/shipments/${shipment.id}/receive`}>
                <Button className="rounded-xl shadow-lg shadow-primary/20">
                  <Inbox className="mr-2 h-4 w-4" /> Receive Shipment
                </Button>
              </Link>
            )}

            {shipment.type === "Outbound" && shipment.status === "Draft" && (
              <Link to={`/shipments/${shipment.id}/pick-pack`}>
                <Button className="rounded-xl shadow-lg shadow-primary/20">
                  <Package className="mr-2 h-4 w-4" /> Pick & Pack Items
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stepper Timeline */}
      <Card className="border border-white/5 bg-background/20 backdrop-blur-sm rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3 md:flex-col md:text-center md:flex-1 relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold text-sm transition-all duration-300 ${
                    step.done
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                      : "bg-background border-white/10 text-muted-foreground"
                  }`}
                >
                  {step.done ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{step.label}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.date}</p>
                </div>
              </div>
            ))}
            {/* Connecting line */}
            <div className="absolute top-11 left-6 right-6 h-0.5 bg-white/5 hidden md:block -z-0" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Logistics metadata */}
        <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" /> Logistics Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1.5 py-2 border-b border-white/5">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> Origin
              </span>
              <div className="font-bold">
                {shipment.type === "Inbound" ? shipment.origin : getWarehouseName(shipment.origin)}
              </div>
            </div>

            <div className="space-y-1.5 py-2 border-b border-white/5">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> Destination
              </span>
              <div className="font-bold">
                {shipment.type === "Inbound" ? getWarehouseName(shipment.destination) : shipment.destination}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2 border-b border-white/5">
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground">Carrier</span>
                <div className="font-bold">{shipment.carrier || "N/A"}</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground">Tracking Number</span>
                <div className="font-bold font-mono text-xs">{shipment.trackingNumber || "N/A"}</div>
              </div>
            </div>

            {shipment.requisitionId && (
              <div className="py-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-4 w-4" /> Referenced Requisition
                </span>
                <Link
                  to={`/requisitions/${shipment.requisitionId}`}
                  className="font-bold text-primary hover:underline block mt-1"
                >
                  View Original Request
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Packing Items */}
        <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Invoice & Item List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Product Description</th>
                    <th className="pb-3 font-semibold">Lot & Expiry</th>
                    <th className="pb-3 font-semibold text-right">Qty Shipped</th>
                    <th className="pb-3 font-semibold text-right">Qty Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {shipment.items.map((item, index) => {
                    const prod = getProductDetails(item.productId)
                    return (
                      <tr key={index} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5">
                          <div className="font-bold text-foreground">{prod.name}</div>
                          <span className="font-mono text-xs text-muted-foreground">{prod.sku}</span>
                        </td>
                        <td className="py-3.5">
                          <div className="space-y-0.5">
                            <span className="font-mono text-xs font-semibold block">Lot: {item.lotNumber}</span>
                            {item.expirationDate && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Expiry: {item.expirationDate}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 text-right font-bold text-foreground">
                          {item.quantityShipped} <span className="text-xs text-muted-foreground font-normal">{prod.unitOfMeasure}s</span>
                        </td>
                        <td className="py-3.5 text-right font-black text-emerald-500 bg-emerald-500/5 px-2.5 rounded-lg border border-emerald-500/5">
                          {shipment.status === "Received" || shipment.status === "Partial" ? (
                            <span>{item.quantityReceived}</span>
                          ) : (
                            <span className="text-muted-foreground font-normal italic text-xs">Pending...</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View for Invoice Items */}
            <div className="grid grid-cols-1 gap-4 mt-4 md:hidden">
              {shipment.items.map((item, index) => {
                const prod = getProductDetails(item.productId)
                return (
                  <div key={index} className="bg-background/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3">
                    <div>
                      <div className="font-bold text-foreground">{prod.name}</div>
                      <span className="font-mono text-xs text-muted-foreground">{prod.sku}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-muted-foreground block">Lot Number</span>
                        <span className="font-mono font-semibold block">{item.lotNumber}</span>
                      </div>
                      {item.expirationDate && (
                        <div className="space-y-0.5">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Expiry
                          </span>
                          <span className="font-semibold">{item.expirationDate}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-2">
                      <div className="space-y-0.5">
                        <span className="text-muted-foreground block">Qty Shipped</span>
                        <span className="font-bold text-foreground">
                          {item.quantityShipped} <span className="text-xs text-muted-foreground font-normal">{prod.unitOfMeasure}s</span>
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-muted-foreground block">Qty Received</span>
                        {shipment.status === "Received" || shipment.status === "Partial" ? (
                          <span className="font-black text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/5 inline-block">
                            {item.quantityReceived}
                          </span>
                        ) : (
                          <span className="text-muted-foreground font-normal italic inline-block mt-0.5">Pending...</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
