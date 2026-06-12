import { useState } from "react"
import { Link } from "react-router-dom"
import { useWarehouseStore, type Requisition } from "@/store/useWarehouseStore"
import { Search, Plus, ClipboardList, Calendar, Eye, Trash2, ShieldAlert } from "lucide-react"
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

export function RequisitionsList() {
  const { requisitions, warehouses, products, createRequisition } = useWarehouseStore()
  const [searchTerm, setSearchTerm] = useState("")
  
  // Dialog state
  const [isOpen, setIsOpen] = useState(false)
  const [originWarehouseId, setOriginWarehouseId] = useState("")
  const [destinationWarehouseId, setDestinationWarehouseId] = useState("")
  const [requestedBy, setRequestedBy] = useState("")
  const [urgency, setUrgency] = useState<"High" | "Medium" | "Low">("Medium")

  // Dynamic items list
  const [reqItems, setReqItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: products[0]?.id || "", quantity: 50 }
  ])

  const getWarehouseName = (whId: string) => {
    return warehouses.find((w) => w.id === whId)?.name || whId
  }

  const handleAddRow = () => {
    setReqItems([...reqItems, { productId: products[0]?.id || "", quantity: 50 }])
  }

  const handleRemoveRow = (index: number) => {
    if (reqItems.length === 1) return
    setReqItems(reqItems.filter((_, idx) => idx !== index))
  }

  const handleRowChange = (index: number, field: string, value: string | number) => {
    const updated = [...reqItems]
    updated[index] = { ...updated[index], [field]: value }
    setReqItems(updated)
  }

  const openCreateDialog = () => {
    setOriginWarehouseId(warehouses.find((w) => w.type === "Laboratory" || w.type === "Filling Station")?.id || warehouses[1]?.id || "")
    setDestinationWarehouseId(warehouses.find((w) => w.type === "Warehouse")?.id || warehouses[0]?.id || "")
    setRequestedBy("")
    setUrgency("Medium")
    setReqItems([{ productId: products[0]?.id || "", quantity: 50 }])
    setIsOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!originWarehouseId || !destinationWarehouseId || !requestedBy) return

    const items = reqItems.map((item) => ({
      productId: item.productId,
      quantityRequested: Number(item.quantity),
      quantityFulfilled: 0,
    }))

    createRequisition({
      originWarehouseId,
      destinationWarehouseId,
      requestedBy,
      urgency,
      items,
    })

    setIsOpen(false)
  }

  // Filter requisitions
  const filteredRequisitions = requisitions.filter((r) => {
    const matchesSearch =
      r.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getWarehouseName(r.originWarehouseId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getWarehouseName(r.destinationWarehouseId).toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Status Badge styling
  const getStatusBadge = (status: Requisition["status"]) => {
    switch (status) {
      case "Draft":
        return <Badge variant="secondary" className="rounded-full">Draft</Badge>
      case "Pending Approval":
        return <Badge className="bg-amber-500 text-white rounded-full hover:bg-amber-600 animate-pulse">Pending Approval</Badge>
      case "Approved":
        return <Badge className="bg-sky-500 text-white rounded-full hover:bg-sky-600">Approved</Badge>
      case "Fulfilling":
        return <Badge className="bg-indigo-500 text-white rounded-full hover:bg-indigo-600">Fulfilling Logistics</Badge>
      case "Completed":
        return <Badge className="bg-emerald-500 text-white rounded-full hover:bg-emerald-600">Completed</Badge>
      case "Rejected":
        return <Badge variant="destructive" className="rounded-full">Rejected</Badge>
      default:
        return <Badge className="rounded-full">{status}</Badge>
    }
  }

  // Urgency styling
  const getUrgencyBadge = (urg: Requisition["urgency"]) => {
    switch (urg) {
      case "High":
        return (
          <span className="flex items-center gap-1 text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/10 text-xs font-bold font-mono">
            <ShieldAlert className="h-3 w-3" /> High
          </span>
        )
      case "Medium":
        return (
          <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/10 text-xs font-bold font-mono">
            Medium
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/10 text-xs font-bold font-mono">
            Low
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
            Stock Requisitions
          </h2>
          <p className="text-muted-foreground mt-1">
            Request inventory for engineering depots and laboratories, approve incoming orders, and track fulfillment cycles.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="rounded-xl shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> New Requisition
        </Button>
      </div>

      {/* Search Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-background/40 backdrop-blur-sm p-4 rounded-2xl border border-white/5 shadow-sm">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background/50 rounded-xl"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/5 bg-background/30 backdrop-blur-md overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs text-muted-foreground uppercase tracking-wider bg-background/20">
                <th className="p-4 font-semibold">Request #</th>
                <th className="p-4 font-semibold">Requestor</th>
                <th className="p-4 font-semibold">Origin Depot</th>
                <th className="p-4 font-semibold">Serving Warehouse</th>
                <th className="p-4 font-semibold">Urgency</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Requested Date</th>
                <th className="p-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredRequisitions.map((req) => (
                <tr key={req.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-primary shrink-0" />
                      <Link to={`/requisitions/${req.id}`} className="hover:text-primary hover:underline transition-colors">
                        {req.requestNumber}
                      </Link>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground block mt-0.5 ml-6">
                      {req.items.length} items requested
                    </span>
                  </td>
                  <td className="p-4 font-semibold">{req.requestedBy}</td>
                  <td className="p-4 text-primary font-semibold">{getWarehouseName(req.originWarehouseId)}</td>
                  <td className="p-4 font-medium text-foreground/80">{getWarehouseName(req.destinationWarehouseId)}</td>
                  <td className="p-4">{getUrgencyBadge(req.urgency)}</td>
                  <td className="p-4">{getStatusBadge(req.status)}</td>
                  <td className="p-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{req.requestedDate}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <Link to={`/requisitions/${req.id}`}>
                      <Button variant="outline" size="sm" className="rounded-lg h-9 border-white/10">
                        <Eye className="h-4 w-4 mr-1.5" /> View Detail
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredRequisitions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground bg-background/10">
                    No requisitions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Requisition Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto rounded-3xl border-white/10 glass-card">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">New Inventory Request</DialogTitle>
              <DialogDescription>
                Submit a new request for items to be dispatched to an active warehouse or laboratory depot.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reqOrigin">Requesting Depot (Origin) *</Label>
                  <select
                    id="reqOrigin"
                    value={originWarehouseId}
                    onChange={(e) => setOriginWarehouseId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reqDest">Fulfilling Facility (Destination) *</Label>
                  <select
                    id="reqDest"
                    value={destinationWarehouseId}
                    onChange={(e) => setDestinationWarehouseId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reqBy">Requested By (Staff Name) *</Label>
                  <Input
                    id="reqBy"
                    placeholder="e.g. Nurse Sarah"
                    value={requestedBy}
                    onChange={(e) => setRequestedBy(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="urgency">Urgency Priority</Label>
                  <select
                    id="urgency"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as "High" | "Medium" | "Low")}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-sm font-bold text-foreground">Requested Products</span>
                  <Button type="button" size="sm" variant="ghost" onClick={handleAddRow} className="text-primary hover:bg-primary/10 h-8">
                    <Plus className="h-4 w-4 mr-1" /> Add Product Row
                  </Button>
                </div>

                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                  {reqItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-end bg-muted/20 p-2.5 rounded-xl border border-white/5">
                      <div className="flex-1 space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase font-bold">Product</Label>
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

                      <div className="w-24 space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase font-bold">Qty Requested</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleRowChange(idx, "quantity", Number(e.target.value))}
                          min={1}
                          className="h-9 px-2 rounded-lg text-xs"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRow(idx)}
                        disabled={reqItems.length === 1}
                        className="h-9 w-9 text-rose-500 hover:bg-rose-500/10 rounded-lg shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl">
                Submit Requisition
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
