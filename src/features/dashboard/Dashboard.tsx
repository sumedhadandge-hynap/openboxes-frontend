import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Truck, AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react"
import { useWarehouseStore } from "@/store/useWarehouseStore"

export function Dashboard() {
  const { products, warehouses, inventory, shipments, selectedWarehouseId } = useWarehouseStore()

  // Calculate dynamic stats scoped to selectedWarehouseId
  const activeInventory = inventory.filter((item) => item.warehouseId === selectedWarehouseId)
  const totalQty = activeInventory.reduce((sum, item) => sum + item.quantityOnHand, 0)

  const activeShipments = shipments.filter(
    (s) =>
      s.status !== "Received" &&
      s.status !== "Cancelled" &&
      ((s.type === "Inbound" && s.destination === selectedWarehouseId) ||
        (s.type === "Outbound" && s.origin === selectedWarehouseId))
  )
  const shipmentsCount = activeShipments.length

  const lowStockProducts = products.filter((p) => {
    const stock = inventory
      .filter((item) => item.productId === p.id && item.warehouseId === selectedWarehouseId)
      .reduce((sum, item) => sum + item.quantityOnHand, 0)
    return stock < p.minLevel
  })
  const criticalAlertsCount = lowStockProducts.length

  const fulfilledShipments = shipments.filter(
    (s) =>
      s.status === "Received" &&
      ((s.type === "Inbound" && s.destination === selectedWarehouseId) ||
        (s.type === "Outbound" && s.origin === selectedWarehouseId))
  )
  const fulfilledCount = fulfilledShipments.length

  const stats = [
    {
      title: "Total Inventory",
      value: `${totalQty.toLocaleString()}`,
      icon: Package,
      trend: "+4.1%",
      positive: true,
      description: "items in stock",
      color: "from-blue-500/20 to-indigo-500/20",
      textColor: "text-blue-500"
    },
    {
      title: "Active Shipments",
      value: `${shipmentsCount}`,
      icon: Truck,
      trend: "+8.2%",
      positive: true,
      description: "en route / picking",
      color: "from-emerald-500/20 to-teal-500/20",
      textColor: "text-emerald-500"
    },
    {
      title: "Critical Alerts",
      value: `${criticalAlertsCount}`,
      icon: AlertTriangle,
      trend: "-12.5%",
      positive: true,
      description: "below safety level",
      color: "from-rose-500/20 to-orange-500/20",
      textColor: "text-rose-500"
    },
    {
      title: "Fulfilled Shipments",
      value: `${fulfilledCount}`,
      icon: CheckCircle2,
      trend: "+1.2%",
      positive: true,
      description: "completed logs",
      color: "from-purple-500/20 to-pink-500/20",
      textColor: "text-purple-500"
    },
  ]

  const activeWhName = warehouses.find((w) => w.id === selectedWarehouseId)?.name || "Selected Facility"

  const recentActivities = shipments
    .filter((s) => s.destination === selectedWarehouseId || s.origin === selectedWarehouseId)
    .slice(0, 4)
    .map((s) => {
      const isOutbound = s.type === "Outbound"
      const dateStr = s.receivedDate || s.shippedDate || "Recently"
      return {
        id: s.id,
        title: isOutbound ? "Shipment Dispatched" : "Shipment Received",
        description: isOutbound
          ? `Cargo ${s.shipmentNumber} pick/packed and dispatched to project ${s.destination}.`
          : `Cargo ${s.shipmentNumber} checked-in at ${activeWhName} from ${s.origin}.`,
        time: dateStr,
      }
    })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            Overview
          </h2>
          <p className="text-muted-foreground mt-1 text-lg">
            Here's what's happening in your supply chain today.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-background/50 rounded-full px-4 py-2 border border-white/10 shadow-sm backdrop-blur-md">
          <Activity className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm font-medium">System Status: Optimal</span>
        </div>
      </div>
      
      {/* Metrics Bento Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="group relative overflow-hidden border-0 bg-background/40 backdrop-blur-sm shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-background/60">
            {/* Background Gradient Blob */}
            <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${stat.color} blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-70`} />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-xl bg-background shadow-sm ${stat.textColor}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 mt-2">
              <div className="text-4xl font-extrabold tracking-tighter">
                {stat.value}
              </div>
              <div className="flex items-center mt-3 text-sm">
                <span className={`flex items-center font-bold ${stat.positive ? "text-emerald-500" : "text-rose-500"}`}>
                  {stat.positive ? <ArrowUpRight className="mr-1 h-4 w-4" /> : <ArrowDownRight className="mr-1 h-4 w-4" />}
                  {stat.trend}
                </span>
                <span className="ml-2 text-muted-foreground">
                  {stat.description}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Lower Dashboard Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-0 bg-background/40 backdrop-blur-sm shadow-lg overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader>
            <CardTitle className="text-xl font-bold">Activity Feed ({activeWhName})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
              {recentActivities.map((act) => (
                <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted-foreground/10 text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary/20">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-white/5 bg-background/50 backdrop-blur shadow-sm transition-all hover:shadow-md hover:bg-background/80">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-primary">{act.title}</div>
                      <time className="text-xs font-medium text-muted-foreground">{act.time}</time>
                    </div>
                    <div className="text-sm text-foreground/80 leading-snug">
                      {act.description}
                    </div>
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div className="text-center py-10 text-muted-foreground italic text-sm">
                  No recent shipment logs recorded for this warehouse.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-0 bg-background/40 backdrop-blur-sm shadow-lg overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader>
            <CardTitle className="text-xl font-bold">Warehouse Capacities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6 mt-2">
              {warehouses.map((wh) => {
                const isActive = wh.id === selectedWarehouseId
                return (
                  <div key={wh.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-sm ${isActive ? "text-primary" : "text-foreground/80"}`}>
                        {wh.name.split(" ")[0]} {isActive && "(Active)"}
                      </span>
                      <span className={`text-xs font-semibold ${isActive ? "text-primary font-bold" : "text-muted-foreground"}`}>
                        {wh.capacity}%
                      </span>
                    </div>
                    <div className="h-3 w-full bg-muted overflow-hidden rounded-full p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isActive
                            ? "bg-gradient-to-r from-primary to-orange-400"
                            : "bg-muted-foreground/30"
                        }`}
                        style={{ width: `${wh.capacity}%` }}
                      />
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
