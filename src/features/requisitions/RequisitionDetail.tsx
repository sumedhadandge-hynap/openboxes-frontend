import { useParams, Link } from "react-router-dom"
import { useWarehouseStore, type Requisition } from "@/store/useWarehouseStore"
import { ArrowLeft, Calendar, ClipboardList, MapPin, CheckCircle2, ShieldAlert, ArrowRight, ShieldCheck, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function RequisitionDetail() {
  const { id } = useParams<{ id: string }>()
  const {
    requisitions,
    warehouses,
    products,
    shipments,
    approveRequisition,
    rejectRequisition,
    fulfillRequisition,
  } = useWarehouseStore()

  const requisition = requisitions.find((r) => r.id === id)
  if (!requisition) {
    return (
      <div className="p-12 text-center">
        <h3 className="text-xl font-bold">Requisition Not Found</h3>
        <p className="text-muted-foreground mt-2">The requested requisition could not be found.</p>
        <Link to="/requisitions" className="mt-4 inline-block text-primary hover:underline">
          Back to Requisitions
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

  // Find related shipment if fulfilling or completed
  const relatedShipment = shipments.find((s) => s.requisitionId === requisition.id)

  const getStatusBadge = (status: Requisition["status"]) => {
    switch (status) {
      case "Draft":
        return <Badge variant="secondary" className="rounded-full">Draft</Badge>
      case "Pending Approval":
        return <Badge className="bg-amber-500 text-white rounded-full hover:bg-amber-600 animate-pulse">Pending Approval</Badge>
      case "Approved":
        return <Badge className="bg-sky-500 text-white rounded-full hover:bg-sky-600">Approved</Badge>
      case "Fulfilling":
        return <Badge className="bg-indigo-500 text-white rounded-full hover:bg-indigo-600">Fulfilling</Badge>
      case "Completed":
        return <Badge className="bg-emerald-500 text-white rounded-full hover:bg-emerald-600">Completed</Badge>
      case "Rejected":
        return <Badge variant="destructive" className="rounded-full">Rejected</Badge>
      default:
        return <Badge className="rounded-full">{status}</Badge>
    }
  }

  const getUrgencyBadge = (urg: Requisition["urgency"]) => {
    switch (urg) {
      case "High":
        return (
          <Badge variant="destructive" className="rounded-md font-mono">
            High Priority
          </Badge>
        )
      case "Medium":
        return (
          <Badge className="bg-amber-500 text-white rounded-md font-mono hover:bg-amber-600">
            Medium Priority
          </Badge>
        )
      default:
        return (
          <Badge className="bg-emerald-500 text-white rounded-md font-mono hover:bg-emerald-600">
            Low Priority
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Link to="/requisitions" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Requisitions
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono bg-muted px-2.5 py-1 rounded-lg text-muted-foreground border border-white/5 font-semibold">
                {requisition.requestNumber}
              </span>
              {getStatusBadge(requisition.status)}
              {getUrgencyBadge(requisition.urgency)}
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mt-2">Stock Requisition Request</h2>
            <p className="text-muted-foreground mt-1">
              Verify requesting department, item listings, and authorize stock movement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {requisition.status === "Pending Approval" && (
              <>
                <Button variant="outline" onClick={() => rejectRequisition(requisition.id)} className="rounded-xl border-rose-500/10 text-rose-500 hover:bg-rose-500/10">
                  <XCircle className="mr-1.5 h-4 w-4" /> Reject
                </Button>
                <Button onClick={() => approveRequisition(requisition.id)} className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/10">
                  <ShieldCheck className="mr-1.5 h-4 w-4" /> Approve Request
                </Button>
              </>
            )}

            {requisition.status === "Approved" && (
              <Button onClick={() => fulfillRequisition(requisition.id)} className="rounded-xl shadow-lg shadow-primary/20">
                <CheckCircle2 className="mr-1.5 h-4 w-4" /> Fulfill (Create Outbound Dispatch)
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Related Shipment Alert */}
      {requisition.status === "Fulfilling" && relatedShipment && (
        <Card className="border border-indigo-500/10 bg-indigo-500/5 rounded-2xl">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
            <div className="flex gap-2.5">
              <ShieldAlert className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-indigo-950 dark:text-indigo-200">Outbound Dispatch Shipment Created</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Shipment <span className="font-semibold font-mono text-foreground">{relatedShipment.shipmentNumber}</span> is draft-staged to serve this request.
                </p>
              </div>
            </div>
            <Link to={`/shipments/${relatedShipment.id}`}>
              <Button size="sm" className="bg-indigo-500 text-white hover:bg-indigo-600 rounded-lg">
                Start Pick & Pack <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {requisition.status === "Completed" && (
        <Card className="border border-emerald-500/10 bg-emerald-500/5 rounded-2xl">
          <CardContent className="p-4 flex gap-2.5 text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-950 dark:text-emerald-200">Requisition Cycle Completed</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                All items have been picked, shipped, and successfully received at the destination ward.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Requisition Meta Info */}
        <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" /> Request Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1.5 py-2 border-b border-white/5">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> Requesting Ward (Origin)
              </span>
              <div className="font-bold">{getWarehouseName(requisition.originWarehouseId)}</div>
            </div>

            <div className="space-y-1.5 py-2 border-b border-white/5">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> Serving Warehouse (Destination)
              </span>
              <div className="font-bold">{getWarehouseName(requisition.destinationWarehouseId)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2 border-b border-white/5">
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground">Requested By</span>
                <div className="font-bold">{requisition.requestedBy}</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground">Request Date</span>
                <div className="font-bold flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {requisition.requestedDate}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requisition Items Table */}
        <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" /> Requested Item List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Product Description</th>
                    <th className="pb-3 font-semibold text-right">Qty Requested</th>
                    <th className="pb-3 font-semibold text-right">Qty Fulfilled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {requisition.items.map((item, index) => {
                    const prod = getProductDetails(item.productId)
                    return (
                      <tr key={index} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 font-bold">
                          {prod.name} <span className="font-mono text-xs text-muted-foreground block">{prod.sku}</span>
                        </td>
                        <td className="py-3.5 text-right font-bold text-foreground">
                          {item.quantityRequested} <span className="text-xs text-muted-foreground font-normal">{prod.unitOfMeasure}s</span>
                        </td>
                        <td className="py-3.5 text-right font-black">
                          {requisition.status === "Completed" ? (
                            <span className="text-emerald-500 bg-emerald-500/5 px-2.5 py-1 border border-emerald-500/5 rounded-lg">{item.quantityFulfilled}</span>
                          ) : requisition.status === "Fulfilling" ? (
                            <span className="text-indigo-500 bg-indigo-500/5 px-2.5 py-1 border border-indigo-500/5 rounded-lg">Fulfilling...</span>
                          ) : (
                            <span className="text-muted-foreground font-normal italic">Pending Approval</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
