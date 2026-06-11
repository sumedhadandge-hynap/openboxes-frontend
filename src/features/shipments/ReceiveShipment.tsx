import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useWarehouseStore } from "@/store/useWarehouseStore"
import { ArrowLeft, CheckCircle2, ChevronRight, ClipboardList, MapPin, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ReceiveShipment() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { shipments, warehouses, products, receiveShipment } = useWarehouseStore()

  const shipment = shipments.find((s) => s.id === id)
  if (!shipment || shipment.type !== "Inbound") {
    return (
      <div className="p-12 text-center">
        <h3 className="text-xl font-bold">Inbound Shipment Not Found</h3>
        <Link to="/shipments" className="mt-4 inline-block text-primary hover:underline">
          Back to Shipments
        </Link>
      </div>
    )
  }

  // Multi-step state
  const [step, setStep] = useState(1)
  
  // Step 1: Verification Form
  const [documentRef, setDocumentRef] = useState(shipment.shipmentNumber)
  const [carrier, setCarrier] = useState(shipment.carrier || "")
  const [tracking, setTracking] = useState(shipment.trackingNumber || "")

  // Step 2: Item Inspections
  const [inspections, setInspections] = useState(
    shipment.items.map((item) => ({
      productId: item.productId,
      quantityReceived: item.quantityShipped, // Default to matching shipped quantity
      lotNumber: item.lotNumber,
      expirationDate: item.expirationDate,
      binLocation: item.binLocation || "BIN-A1", // Default putaway bin
    }))
  )

  const getWarehouseName = (whId: string) => {
    return warehouses.find((w) => w.id === whId)?.name || whId
  }

  const getProductDetails = (prodId: string) => {
    return products.find((p) => p.id === prodId) || { name: prodId, sku: "N/A", unitOfMeasure: "Units" }
  }

  const handleInspectionChange = (index: number, field: string, value: any) => {
    const updated = [...inspections]
    updated[index] = { ...updated[index], [field]: value }
    setInspections(updated)
  }

  const handleCompleteReceipt = () => {
    // Perform receiving in the store (this updates inventory + shipment status + requisitions)
    receiveShipment(shipment.id, inspections)
    navigate(`/shipments/${shipment.id}`)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Link
          to={`/shipments/${shipment.id}`}
          className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Shipment Details
        </Link>
        <h2 className="text-3xl font-extrabold tracking-tight">Receive Inbound Shipment</h2>
        <p className="text-muted-foreground mt-1">
          Complete the receiving log to verify packing lists and place products in inventory.
        </p>
      </div>

      {/* Stepper Headers */}
      <div className="flex items-center justify-between bg-background/20 border border-white/5 p-4 rounded-2xl">
        <div className={`flex items-center gap-2 font-bold text-sm ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border ${step >= 1 ? "bg-primary text-primary-foreground border-primary" : "border-white/10"}`}>1</div>
          <span>Verify Documents</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
        <div className={`flex items-center gap-2 font-bold text-sm ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border ${step >= 2 ? "bg-primary text-primary-foreground border-primary" : "border-white/10"}`}>2</div>
          <span>Inspect Products</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
        <div className={`flex items-center gap-2 font-bold text-sm ${step >= 3 ? "text-primary" : "text-muted-foreground"}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border ${step >= 3 ? "bg-primary text-primary-foreground border-primary" : "border-white/10"}`}>3</div>
          <span>Putaway Inventory</span>
        </div>
      </div>

      {/* STEP 1: Verify Documents */}
      {step === 1 && (
        <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" /> Step 1: Logistics & Shipping Info
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="docRef">Delivery Document / Waybill #</Label>
                <Input id="docRef" value={documentRef} onChange={(e) => setDocumentRef(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shipper">Shipper (Origin)</Label>
                <Input id="shipper" value={shipment.origin} disabled className="rounded-xl bg-muted/40 cursor-not-allowed" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="carrier">Carrier / Freight Agent</Label>
                <Input id="carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tracking">Tracking Code</Label>
                <Input id="tracking" value={tracking} onChange={(e) => setTracking(e.target.value)} className="rounded-xl font-mono" />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/5 mt-6">
              <Button type="button" onClick={() => setStep(2)} className="rounded-xl">
                Next: Inspect Products <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: Inspect Products */}
      {step === 2 && (
        <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" /> Step 2: Quality Inspection & Count
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 space-y-4">
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {inspections.map((insp, idx) => {
                const prod = getProductDetails(insp.productId)
                const origItem = shipment.items[idx]
                
                return (
                  <div key={idx} className="bg-muted/20 p-4 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                      <div>
                        <div className="font-bold text-base text-foreground">{prod.name}</div>
                        <span className="font-mono text-xs text-muted-foreground">{prod.sku} | Shipped Qty: <span className="font-black text-foreground">{origItem.quantityShipped}</span></span>
                      </div>
                      <div className="text-xs text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/10 font-semibold font-mono">
                        Declared Lot: {origItem.lotNumber}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Qty Received *</Label>
                        <Input
                          type="number"
                          value={insp.quantityReceived}
                          onChange={(e) => handleInspectionChange(idx, "quantityReceived", Number(e.target.value))}
                          min={0}
                          className="rounded-xl h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Receipt Lot Code *</Label>
                        <Input
                          value={insp.lotNumber}
                          onChange={(e) => handleInspectionChange(idx, "lotNumber", e.target.value)}
                          placeholder="Lot #"
                          required
                          className="rounded-xl h-9 font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Expiration Date</Label>
                        <Input
                          type="date"
                          value={insp.expirationDate}
                          onChange={(e) => handleInspectionChange(idx, "expirationDate", e.target.value)}
                          className="rounded-xl h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Putaway Bin *</Label>
                        <Input
                          value={insp.binLocation}
                          onChange={(e) => handleInspectionChange(idx, "binLocation", e.target.value)}
                          placeholder="e.g. BIN-C3"
                          required
                          className="rounded-xl h-9"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-between pt-4 border-t border-white/5 mt-6">
              <Button type="button" variant="ghost" onClick={() => setStep(1)} className="rounded-xl">
                Back
              </Button>
              <Button type="button" onClick={() => setStep(3)} className="rounded-xl">
                Next: Putaway Summary <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Putaway Inventory */}
      {step === 3 && (
        <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Step 3: Putaway Plan Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 space-y-4">
            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/10 flex gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-primary">Verification Checklist Complete</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Confirming this action will commit received quantities to inventory at the destination facility: <span className="font-semibold text-foreground">{getWarehouseName(shipment.destination)}</span>.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/5 mt-4">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-background/40 border-b border-white/5">
                    <th className="p-3 font-semibold">Product</th>
                    <th className="p-3 font-semibold">Lot Number</th>
                    <th className="p-3 font-semibold">Bin Location</th>
                    <th className="p-3 font-semibold text-right">Receipt Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {inspections.map((insp, idx) => {
                    const prod = getProductDetails(insp.productId)
                    return (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 font-medium">
                          {prod.name} <span className="font-mono text-xs text-muted-foreground block">{prod.sku}</span>
                        </td>
                        <td className="p-3 font-mono text-xs font-semibold">{insp.lotNumber}</td>
                        <td className="p-3 font-semibold text-muted-foreground">{insp.binLocation}</td>
                        <td className="p-3 text-right font-black text-foreground">
                          {insp.quantityReceived} <span className="text-xs text-muted-foreground font-normal">{prod.unitOfMeasure}s</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between pt-4 border-t border-white/5 mt-6">
              <Button type="button" variant="ghost" onClick={() => setStep(2)} className="rounded-xl">
                Back
              </Button>
              <Button type="button" onClick={handleCompleteReceipt} className="rounded-xl shadow-lg shadow-primary/20">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Commit Stock Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
