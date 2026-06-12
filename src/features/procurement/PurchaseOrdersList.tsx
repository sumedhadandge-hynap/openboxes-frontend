import { useState } from "react"
import { useWarehouseStore, type PurchaseOrderItem } from "@/store/useWarehouseStore"
import { Search, Plus, Calendar, FileText, CheckCircle2, Trash2 } from "lucide-react"
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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// Zod schemas
const poSchema = z.object({
  supplier: z.string().min(1, "Please select a supplier"),
  deliveryDate: z.string().min(1, "Please select an expected delivery date"),
})

export function PurchaseOrdersList() {
  const { purchaseOrders, products, createPurchaseOrder, approvePurchaseOrder, selectedWarehouseId } = useWarehouseStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  // Modal State
  const [isOpen, setIsOpen] = useState(false)
  const [addedItems, setAddedItems] = useState<PurchaseOrderItem[]>([])
  
  // Custom item inputs
  const [selectedProdId, setSelectedProdId] = useState("")
  const [inputQty, setInputQty] = useState(1)
  const [inputPrice, setInputPrice] = useState(100)
  const [itemError, setItemError] = useState("")

  const getProductDetails = (prodId: string) => {
    return products.find((p) => p.id === prodId) || { name: "Unknown Product", sku: "N/A" }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val)
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(poSchema),
  })

  const openCreateDialog = () => {
    setAddedItems([])
    setSelectedProdId(products[0]?.id || "")
    setInputQty(1)
    setInputPrice(100)
    setItemError("")
    reset()
    setIsOpen(true)
  }

  const handleAddItem = () => {
    if (!selectedProdId) {
      setItemError("Please select a product")
      return
    }
    if (inputQty <= 0) {
      setItemError("Quantity must be positive")
      return
    }
    if (inputPrice <= 0) {
      setItemError("Price must be positive")
      return
    }

    const item: PurchaseOrderItem = {
      productId: selectedProdId,
      quantityOrdered: Number(inputQty),
      unitPrice: Number(inputPrice),
    }

    // Check if product is already added
    const existingIdx = addedItems.findIndex((it) => it.productId === selectedProdId)
    if (existingIdx !== -1) {
      const updated = [...addedItems]
      updated[existingIdx].quantityOrdered += Number(inputQty)
      setAddedItems(updated)
    } else {
      setAddedItems([...addedItems, item])
    }

    setItemError("")
  }

  const handleRemoveItem = (index: number) => {
    setAddedItems(addedItems.filter((_, i) => i !== index))
  }

  const onSubmit = (data: z.infer<typeof poSchema>) => {
    if (addedItems.length === 0) {
      setItemError("Please add at least one item to the purchase order")
      return
    }

    createPurchaseOrder({
      supplier: data.supplier,
      deliveryDate: data.deliveryDate,
      items: addedItems,
    })

    setIsOpen(false)
  }

  // Filter Purchase Orders
  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesWh = po.warehouseId === selectedWarehouseId
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || po.status === statusFilter
    return matchesWh && matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
            Purchase Orders (POs)
          </h2>
          <p className="text-muted-foreground mt-0.5">
            Log official procurement contracts and manage hardware arrivals from manufacturing vendors.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="rounded-xl shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Create Purchase Order
        </Button>
      </div>

      {/* Filters Card */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-background/40 backdrop-blur-sm p-4 rounded-2xl border border-white/5 shadow-sm">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search PO Number, Supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background/50 rounded-xl"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto py-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2 shrink-0">
            PO Status:
          </span>
          {["All", "Pending Approval", "Approved", "Completed", "Cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                statusFilter === st
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reusable Data Table */}
      <div className="rounded-2xl border border-white/5 bg-background/30 backdrop-blur-md overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs text-muted-foreground uppercase tracking-wider bg-background/20">
                <th className="p-4 font-semibold">PO Details</th>
                <th className="p-4 font-semibold">Supplier</th>
                <th className="p-4 font-semibold">Timeline</th>
                <th className="p-4 font-semibold text-right">Order Value</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredPOs.map((po) => {
                const poSum = po.items.reduce((sum, item) => sum + item.quantityOrdered * item.unitPrice, 0)
                const itemsCount = po.items.reduce((sum, item) => sum + item.quantityOrdered, 0)

                return (
                  <tr key={po.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <span className="font-mono text-sm font-black text-foreground">{po.poNumber}</span>
                          <div className="text-[10px] text-muted-foreground uppercase">{itemsCount} units ordered</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-foreground/80">{po.supplier}</td>
                    <td className="p-4">
                      <div className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>Ordered: {po.orderDate}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Expected: {po.deliveryDate}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-black text-foreground text-base">
                      {formatCurrency(poSum)}
                    </td>
                    <td className="p-4 text-center">
                      <Badge
                        className="rounded-full text-[10px] font-bold px-2 py-0.5"
                        variant={
                          po.status === "Completed"
                            ? "default"
                            : po.status === "Approved"
                            ? "secondary"
                            : po.status === "Pending Approval"
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {po.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-center">
                        {po.status === "Pending Approval" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => approvePurchaseOrder(po.id)}
                            className="rounded-lg h-8 border-white/10 hover:bg-emerald-500/10 hover:text-emerald-500"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                        )}
                        {po.status === "Approved" && (
                          <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Authorized
                          </span>
                        )}
                        {po.status === "Completed" && (
                          <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Fully Received
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredPOs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground bg-background/10">
                    No purchase orders found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal (Multi-step Zod Validated Form) */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-3xl border-white/10 glass-card max-h-[90vh] overflow-y-auto pr-2 scrollbar-hide">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create Purchase Order</DialogTitle>
              <DialogDescription>
                Issue a materials procurement request. Authorized POs are ready for inbound shipment processing.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Header Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="supplier">Supplier Vendor *</Label>
                  <select
                    id="supplier"
                    {...register("supplier")}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background"
                  >
                    <option value="">-- Select Supplier --</option>
                    <option value="HD Fire Protect Pvt. Ltd.">HD Fire Protect Pvt. Ltd.</option>
                    <option value="Tyco Safety Products">Tyco Safety Products</option>
                    <option value="Siemens India Ltd.">Siemens India Ltd.</option>
                    <option value="Kirloskar Brothers Pumps">Kirloskar Brothers Pumps</option>
                  </select>
                  {errors.supplier && <p className="text-xs text-destructive font-medium">{errors.supplier.message}</p>}
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="deliveryDate">Expected Delivery *</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    {...register("deliveryDate")}
                    className="rounded-xl bg-background/50 focus:bg-background"
                  />
                  {errors.deliveryDate && <p className="text-xs text-destructive font-medium">{errors.deliveryDate.message}</p>}
                </div>
              </div>

              {/* Item Adder */}
              <div className="border-t border-white/5 pt-4 mt-2">
                <h4 className="text-sm font-semibold text-foreground mb-3">Add Order Items</h4>
                <div className="grid grid-cols-12 gap-3 items-end bg-muted/30 p-3 rounded-2xl border border-white/5">
                  <div className="col-span-6 space-y-1">
                    <Label className="text-xs">Product Spec</Label>
                    <select
                      value={selectedProdId}
                      onChange={(e) => setSelectedProdId(e.target.value)}
                      className="w-full h-9 px-2 rounded-lg border border-input bg-background/50 text-xs focus:outline-none"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      value={inputQty}
                      onChange={(e) => setInputQty(Number(e.target.value))}
                      min={1}
                      className="h-9 text-xs rounded-lg"
                    />
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-xs">Unit Cost (₹)</Label>
                    <Input
                      type="number"
                      value={inputPrice}
                      onChange={(e) => setInputPrice(Number(e.target.value))}
                      min={1}
                      className="h-9 text-xs rounded-lg"
                    />
                  </div>
                  
                  <div className="col-span-12 flex justify-end">
                    <Button type="button" size="sm" onClick={handleAddItem} className="h-8 rounded-lg text-xs font-semibold">
                      Add to List
                    </Button>
                  </div>
                </div>
                {itemError && <p className="text-xs text-rose-500 font-bold mt-2 animate-pulse">{itemError}</p>}
              </div>

              {/* Added Items List */}
              <div className="mt-2 space-y-2">
                <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Order Basket ({addedItems.length} items)</Label>
                <div className="max-h-[150px] overflow-y-auto border border-white/5 rounded-2xl bg-background/40 divide-y divide-white/5 scrollbar-hide">
                  {addedItems.map((item, idx) => {
                    const prod = getProductDetails(item.productId)
                    return (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-white/5 transition-all">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-foreground/90">{prod.name}</span>
                          <div className="text-[10px] text-muted-foreground">Qty: {item.quantityOrdered} | Rate: {formatCurrency(item.unitPrice)}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-foreground">{formatCurrency(item.quantityOrdered * item.unitPrice)}</span>
                          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(idx)} className="h-6 w-6 text-rose-500 hover:bg-rose-500/10 rounded-md">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                  {addedItems.length === 0 && (
                    <div className="p-6 text-center text-muted-foreground italic text-xs">
                      No materials added. Please use the adder above.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-white/5 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl">
                Save PO (Request Authorization)
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
