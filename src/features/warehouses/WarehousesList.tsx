import { useState } from "react"
import { useWarehouseStore } from "@/store/useWarehouseStore"
import { Plus, Warehouse, MapPin, User, Activity, PackageCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export function WarehousesList() {
  const { warehouses, inventory, addWarehouse } = useWarehouseStore()
  
  // Dialog state
  const [isOpen, setIsOpen] = useState(false)
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [type, setType] = useState<"Warehouse" | "Pharmacy" | "Cold Storage" | "Clinic">("Warehouse")
  const [location, setLocation] = useState("")
  const [manager, setManager] = useState("")

  const openAddDialog = () => {
    setCode("")
    setName("")
    setType("Warehouse")
    setLocation("")
    setManager("")
    setIsOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || !name) return

    addWarehouse({
      code,
      name,
      type,
      location,
      manager,
      status: "Active",
    })

    setIsOpen(false)
  }

  // Helper to get stats for a warehouse
  const getWarehouseStats = (whId: string) => {
    const whStock = inventory.filter((item) => item.warehouseId === whId)
    const uniqueProducts = new Set(whStock.map((item) => item.productId)).size
    const totalQty = whStock.reduce((sum, item) => sum + item.quantityOnHand, 0)
    return { uniqueProducts, totalQty }
  }

  // Helper for progress bar color
  const getProgressBarColor = (capacity: number) => {
    if (capacity >= 80) return "from-rose-500 to-orange-500"
    if (capacity >= 50) return "from-amber-400 to-orange-400"
    return "from-emerald-400 to-teal-400"
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
            Facilities & Warehouses
          </h2>
          <p className="text-muted-foreground mt-1">
            Monitor storage capacities, managers, and stock distributions across physical warehouses and wards.
          </p>
        </div>
        <Button onClick={openAddDialog} className="rounded-xl shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Add Facility
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {warehouses.map((wh) => {
          const { uniqueProducts, totalQty } = getWarehouseStats(wh.id)
          const capacityVal = wh.capacity || 0

          return (
            <Card
              key={wh.id}
              className="relative overflow-hidden border border-white/5 bg-background/30 backdrop-blur-md hover:bg-background/40 transition-all hover:shadow-lg rounded-2xl group"
            >
              {/* Radial gradient background hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="flex flex-row items-start justify-between pb-3 relative z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground uppercase font-bold tracking-wider">
                      {wh.code}
                    </span>
                    <Badge variant={wh.status === "Active" ? "default" : "secondary"} className="rounded-full text-[10px]">
                      {wh.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold mt-1 text-foreground/90 group-hover:text-primary transition-colors">
                    {wh.name}
                  </CardTitle>
                </div>
                <div className="p-2.5 rounded-xl bg-background shadow-sm text-primary shrink-0">
                  <Warehouse className="h-5 w-5" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 relative z-10">
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{wh.location || "No location set"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 shrink-0" />
                    <span>Mgr: <span className="font-semibold text-foreground/80">{wh.manager || "Unassigned"}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 shrink-0" />
                    <span>Type: <span className="font-semibold text-foreground/80">{wh.type}</span></span>
                  </div>
                </div>

                {/* Utilization gauge */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground uppercase tracking-wider">Storage Capacity</span>
                    <span className="font-bold text-primary">{capacityVal}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-muted overflow-hidden rounded-full p-0.5 border border-white/5">
                    <div
                      className={`h-full bg-gradient-to-r ${getProgressBarColor(capacityVal)} rounded-full transition-all duration-500`}
                      style={{ width: `${capacityVal}%` }}
                    />
                  </div>
                </div>

                {/* Warehouse Stock summary */}
                <div className="grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-white/5 bg-muted/20 p-3 rounded-xl">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">SKUs Stored</span>
                    <span className="font-extrabold text-base text-foreground flex items-center gap-1.5 mt-0.5">
                      <PackageCheck className="h-4 w-4 text-primary" />
                      {uniqueProducts}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Total Quantity</span>
                    <span className="font-extrabold text-base text-foreground mt-0.5 block">
                      {totalQty}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add Facility Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl border-white/10 glass-card">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add New Facility</DialogTitle>
              <DialogDescription>
                Define a physical warehouse location, pharmacy ward, or clinic storage area.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5 col-span-1">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    placeholder="e.g. WH2"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="rounded-xl uppercase font-mono"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="name">Facility Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. West Wing Pharmacy"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="type">Facility Type</Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="Warehouse">Central Warehouse</option>
                  <option value="Pharmacy">Pharmacy Ward</option>
                  <option value="Cold Storage">Cold Storage Hub</option>
                  <option value="Clinic">Clinic Room</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location">Physical Address / Zone</Label>
                <Input
                  id="location"
                  placeholder="e.g. Building A, Room 102"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="manager">Facility Manager</Label>
                <Input
                  id="manager"
                  placeholder="e.g. Johnathan Smith"
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl">
                Create Facility
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
