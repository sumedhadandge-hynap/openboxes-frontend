import { Link } from "react-router-dom"
import { useWarehouseStore } from "@/store/useWarehouseStore"
import { ShoppingCart, TrendingUp, Clock, ArrowRight, ShieldCheck, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ProcurementPage() {
  const { purchaseOrders } = useWarehouseStore()

  // Calculate stats
  const totalSpend = purchaseOrders
    .filter(po => po.status !== "Cancelled")
    .reduce((sum, po) => {
      const poSum = po.items.reduce((itemSum, item) => itemSum + item.quantityOrdered * item.unitPrice, 0)
      return sum + poSum
    }, 0)

  const pendingApprovalCount = purchaseOrders.filter(po => po.status === "Pending Approval").length
  const activeCount = purchaseOrders.filter(po => po.status === "Approved").length
  const completedCount = purchaseOrders.filter(po => po.status === "Completed").length


  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val)
  }

  // Supplier list with mock metrics
  const suppliers = [
    { name: "HD Fire Protect Pvt. Ltd.", rating: 4.8, activeOrders: 1, delayRate: "2.4h", label: "Preferred" },
    { name: "Tyco Safety Products", rating: 4.6, activeOrders: 0, delayRate: "4.1h", label: "Contract" },
    { name: "Siemens India Ltd.", rating: 4.9, activeOrders: 1, delayRate: "1.2h", label: "Specialty" },
    { name: "Kirloskar Brothers Pumps", rating: 4.5, activeOrders: 0, delayRate: "6.0h", label: "Contract" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
            Procurement & Supply Control
          </h2>
          <p className="text-muted-foreground mt-0.5">
            Manage vendor contracts, approve purchase orders, and monitor heavy equipment procurement.
          </p>
        </div>
        <Link to="/purchase-orders">
          <Button className="rounded-xl shadow-lg shadow-primary/20">
            View Purchase Orders <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="border border-white/5 bg-background/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Total Material Spend</span>
            <span className="text-2xl font-black text-foreground">{formatCurrency(totalSpend)}</span>
          </div>
        </Card>

        <Card className="border border-white/5 bg-background/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Active POs</span>
            <span className="text-2xl font-black text-foreground">{activeCount} Orders</span>
          </div>
        </Card>

        <Card className="border border-white/5 bg-background/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Awaiting Approval</span>
            <span className="text-2xl font-black text-foreground">{pendingApprovalCount} Orders</span>
          </div>
        </Card>

        <Card className="border border-white/5 bg-background/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Completed Receipts</span>
            <span className="text-2xl font-black text-foreground">{completedCount} Orders</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
        {/* Supplier Performance */}
        <Card className="md:col-span-4 border-0 bg-background/30 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden relative group">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Approved Vendors & Performance</CardTitle>
            <CardDescription>Metrics are based on lead times and inspection checklist pass rates.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suppliers.map((sup, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-background/50 border border-white/5 hover:bg-background/80 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{sup.name}</span>
                      <Badge variant="outline" className="text-[9px] font-bold text-primary border-primary/20 rounded-md">
                        {sup.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Active POs: <strong className="text-foreground">{sup.activeOrders}</strong></span>
                      <span>Avg Putaway Delay: <strong className="text-foreground">{sup.delayRate}</strong></span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-sm font-bold w-fit">
                    <Star className="h-4 w-4 fill-primary shrink-0" />
                    <span>{sup.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Requisitions (Needs Action) */}
        <Card className="md:col-span-3 border-0 bg-background/30 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden group">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Recent PO Material Checklist</CardTitle>
            <CardDescription>A list of recently procured items and their quantities.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
              {purchaseOrders.slice(0, 3).map((po) => {
                const totalItemsQty = po.items.reduce((sum, item) => sum + item.quantityOrdered, 0)
                const poSum = po.items.reduce((sum, item) => sum + item.quantityOrdered * item.unitPrice, 0)

                return (
                  <div key={po.id} className="p-3 border border-white/5 rounded-xl bg-background/40 hover:bg-background/60 transition-all flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary">{po.poNumber}</span>
                      <Badge variant={po.status === "Completed" ? "default" : po.status === "Approved" ? "secondary" : "outline"} className="rounded-full text-[10px]">
                        {po.status}
                      </Badge>
                    </div>
                    
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Supplier:</span>
                        <span className="font-semibold text-foreground/95 truncate max-w-[150px]">{po.supplier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Units:</span>
                        <span className="font-semibold">{totalItemsQty} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. Value:</span>
                        <span className="font-black text-foreground">{formatCurrency(poSum)}</span>
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
