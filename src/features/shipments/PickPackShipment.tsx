import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useWarehouseStore } from "@/store/useWarehouseStore"
import { ArrowLeft, CheckCircle2, ChevronRight, ClipboardList, Truck, AlertCircle, Box } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export function PickPackShipShipment() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { shipments, warehouses, products, inventory, pickPackShipOutbound } = useWarehouseStore()

  const shipment = shipments.find((s) => s.id === id)
  if (!shipment || shipment.type !== "Outbound") {
    return (
      <div className="p-12 text-center">
        <h3 className="text-xl font-bold">Outbound Shipment Not Found</h3>
        <Link to="/shipments" className="mt-4 inline-block text-primary hover:underline">
          Back to Shipments
        </Link>
      </div>
    )
  }

  // Stepper state
  const [step, setStep] = useState(1)

  // Step 1: Picking assignments
  // We want to maps shipment items to chosen lot, bin, and quantity.
  // Initially, we look up inventory at origin warehouse for each product.
  const getAvailableInventory = (productId: string) => {
    return inventory.filter((item) => item.productId === productId && item.warehouseId === shipment.origin)
  }

  // Initialize pick list. For each shipment item, try to find matching inventory and auto-fill.
  const [picks, setPicks] = useState(
    shipment.items.map((item) => {
      const avail = getAvailableInventory(item.productId)
      const firstAvail = avail[0]
      return {
        productId: item.productId,
        quantityNeeded: item.quantityShipped,
        pickedLot: firstAvail?.lotNumber || "",
        pickedBin: firstAvail?.binLocation || "",
        quantityPicked: firstAvail ? Math.min(item.quantityShipped, firstAvail.quantityOnHand) : 0,
        availQty: firstAvail?.quantityOnHand || 0,
      }
    })
  )

  // Step 3: Courier details
  const [carrier, setCarrier] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")

  const getWarehouseName = (whId: string) => {
    return warehouses.find((w) => w.id === whId)?.name || whId
  }

  const getProductDetails = (prodId: string) => {
    return products.find((p) => p.id === prodId) || { name: prodId, sku: "N/A", unitOfMeasure: "Units" }
  }

  const handlePickChange = (index: number, field: string, value: any) => {
    const updated = [...picks]
    if (field === "pickedLot") {
      // If lot changes, update bin and available quantity to match that lot in stock
      const avail = getAvailableInventory(updated[index].productId)
      const selectedInv = avail.find((i) => i.lotNumber === value)
      updated[index] = {
        ...updated[index],
        pickedLot: value,
        pickedBin: selectedInv?.binLocation || "",
        availQty: selectedInv?.quantityOnHand || 0,
        quantityPicked: selectedInv ? Math.min(updated[index].quantityNeeded, selectedInv.quantityOnHand) : 0,
      }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    setPicks(updated)
  }

  const handleShipSubmit = () => {
    // Form validation
    const invalidPick = picks.some((p) => p.quantityPicked <= 0 || p.quantityPicked > p.availQty)
    if (invalidPick) {
      alert("Please ensure picked quantities are valid and within available stock limits.")
      return
    }

    const packedItems = picks.map((p) => ({
      productId: p.productId,
      lotNumber: p.pickedLot,
      binLocation: p.pickedBin,
      quantity: p.quantityPicked,
    }))

    pickPackShipOutbound(shipment.id, carrier, trackingNumber, packedItems)
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
        <h2 className="text-3xl font-extrabold tracking-tight">Outbound Pick & Pack Wizard</h2>
        <p className="text-muted-foreground mt-1">
          Pick available stock from warehouse bins, group into packages, and dispatch.
        </p>
      </div>

      {/* Stepper Header */}
      <div className="flex items-center justify-between bg-background/20 border border-white/5 p-4 rounded-2xl">
        <div className={`flex items-center gap-2 font-bold text-sm ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border ${step >= 1 ? "bg-primary text-primary-foreground border-primary" : "border-white/10"}`}>1</div>
          <span>Pick Stock from Bins</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
        <div className={`flex items-center gap-2 font-bold text-sm ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border ${step >= 2 ? "bg-primary text-primary-foreground border-primary" : "border-white/10"}`}>2</div>
          <span>Pack Containers</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
        <div className={`flex items-center gap-2 font-bold text-sm ${step >= 3 ? "text-primary" : "text-muted-foreground"}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border ${step >= 3 ? "bg-primary text-primary-foreground border-primary" : "border-white/10"}`}>3</div>
          <span>Ship Logistics Dispatch</span>
        </div>
      </div>

      {/* STEP 1: Picking List */}
      {step === 1 && (
        <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" /> Step 1: Picking List Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 space-y-4">
            <div className="space-y-4">
              {picks.map((pick, idx) => {
                const prod = getProductDetails(pick.productId)
                const availLots = getAvailableInventory(pick.productId)
                const hasStock = availLots.length > 0
                
                return (
                  <div key={idx} className="bg-muted/20 p-4 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                      <div>
                        <div className="font-bold text-base text-foreground">{prod.name}</div>
                        <span className="font-mono text-xs text-muted-foreground">{prod.sku} | Required: <span className="font-black text-foreground">{pick.quantityNeeded} {prod.unitOfMeasure}s</span></span>
                      </div>
                      {!hasStock && (
                        <span className="flex items-center gap-1.5 text-xs text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-lg font-bold border border-rose-500/10">
                          <AlertCircle className="h-4 w-4" /> Out Of Stock in Facility
                        </span>
                      )}
                    </div>

                    {hasStock && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                          <Label className="text-xs">Pick Lot *</Label>
                          <select
                            value={pick.pickedLot}
                            onChange={(e) => handlePickChange(idx, "pickedLot", e.target.value)}
                            className="w-full h-9 px-2 rounded-xl border border-input bg-background/50 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                          >
                            {availLots.map((inv) => (
                              <option key={inv.id} value={inv.lotNumber}>
                                Lot: {inv.lotNumber} ({inv.quantityOnHand} avail)
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Bin Location</Label>
                          <Input value={pick.pickedBin} disabled className="h-9 rounded-xl bg-muted/40 cursor-not-allowed text-xs font-semibold" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Pick Quantity *</Label>
                          <Input
                            type="number"
                            value={pick.quantityPicked}
                            onChange={(e) => handlePickChange(idx, "quantityPicked", Number(e.target.value))}
                            min={0}
                            max={pick.availQty}
                            className="h-9 rounded-xl text-xs"
                          />
                        </div>
                        <div className="pb-1 text-xs font-bold text-muted-foreground">
                          {pick.quantityPicked >= pick.quantityNeeded ? (
                            <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 rounded">Fully Picked</Badge>
                          ) : (
                            <Badge className="bg-amber-500 text-white hover:bg-amber-600 rounded">Partial ({pick.quantityPicked}/{pick.quantityNeeded})</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-white/5 mt-6">
              <Button type="button" onClick={() => setStep(2)} className="rounded-xl">
                Next: Pack Items <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: Pack Items */}
      {step === 2 && (
        <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Box className="h-5 w-5 text-primary" /> Step 2: Packaging & Boxing
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 space-y-4">
            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/10 flex gap-3">
              <Box className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-primary">Consolidation Complete</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Picked items are automatically packed into standard shipping container: <span className="font-semibold text-foreground">Box-01 (Heavy Duty Container)</span>.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/5 mt-4">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-background/40 border-b border-white/5">
                    <th className="p-3 font-semibold">Packed Item</th>
                    <th className="p-3 font-semibold">Origin Location</th>
                    <th className="p-3 font-semibold">Lot Number</th>
                    <th className="p-3 font-semibold text-right">Picked Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {picks.map((pick, idx) => {
                    const prod = getProductDetails(pick.productId)
                    return (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 font-medium">
                          {prod.name} <span className="font-mono text-xs text-muted-foreground block">{prod.sku}</span>
                        </td>
                        <td className="p-3 font-semibold text-muted-foreground">
                          {getWarehouseName(shipment.origin)} ({pick.pickedBin})
                        </td>
                        <td className="p-3 font-mono text-xs font-semibold">{pick.pickedLot}</td>
                        <td className="p-3 text-right font-black text-foreground">
                          {pick.quantityPicked} <span className="text-xs text-muted-foreground font-normal">{prod.unitOfMeasure}s</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between pt-4 border-t border-white/5 mt-6">
              <Button type="button" variant="ghost" onClick={() => setStep(1)} className="rounded-xl">
                Back
              </Button>
              <Button type="button" onClick={() => setStep(3)} className="rounded-xl">
                Next: Courier details <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Ship / Dispatch */}
      {step === 3 && (
        <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" /> Step 3: Courier & Waybill details
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="carrier">Logistics Carrier *</Label>
                <Input
                  id="carrier"
                  placeholder="e.g. DHL Express, FedEx, local driver"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tracking">Tracking Code / Waybill *</Label>
                <Input
                  id="tracking"
                  placeholder="e.g. TRK9904294"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  required
                  className="rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-white/5 mt-6">
              <Button type="button" variant="ghost" onClick={() => setStep(2)} className="rounded-xl">
                Back
              </Button>
              <Button type="button" onClick={handleShipSubmit} className="rounded-xl shadow-lg shadow-primary/20">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Ship & Complete Outbound
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
