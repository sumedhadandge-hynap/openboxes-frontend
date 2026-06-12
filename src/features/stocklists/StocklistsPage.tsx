import { useState } from "react"
import { ListChecks, Plus, Search, Eye, ShoppingCart, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface StocklistItem {
  sku: string
  name: string
  targetQty: number
  uom: string
}

interface Stocklist {
  id: string
  name: string
  facility: string
  itemsCount: number
  urgency: "High" | "Medium" | "Low"
  items: StocklistItem[]
}

const initialStocklists: Stocklist[] = [
  {
    id: "SL-001",
    name: "Standard Sprinkler Installation Kit",
    facility: "Central Piping & Heavy Warehouse",
    itemsCount: 3,
    urgency: "High",
    items: [
      { sku: "SPR-PEND-68", name: "Pendent Fire Sprinkler 68°C", targetQty: 200, uom: "Each" },
      { sku: "VAL-BTFY-04", name: "Grooved Butterfly Valve 4\"", targetQty: 10, uom: "Each" },
      { sku: "FAP-ADDR-08", name: "Addressable Fire Alarm Panel 8-Loop", targetQty: 2, uom: "Each" },
    ],
  },
  {
    id: "SL-002",
    name: "Site Hydrant Maintenance Kit",
    facility: "Electronics & Instrument Lab",
    itemsCount: 2,
    urgency: "Medium",
    items: [
      { sku: "EXT-CO2-45", name: "CO2 Fire Extinguisher 4.5kg", targetQty: 50, uom: "Each" },
      { sku: "VAL-BTFY-04", name: "Grooved Butterfly Valve 4\"", targetQty: 5, uom: "Each" },
    ],
  },
  {
    id: "SL-003",
    name: "Gas Suppression Station Setup Pack",
    facility: "Gas Filling & Suppression Station",
    itemsCount: 1,
    urgency: "High",
    items: [
      { sku: "CYL-FM200-80", name: "FM200 Suppression Cylinder 80L", targetQty: 15, uom: "Cylinders" },
    ],
  },
]

export function StocklistsPage() {
  const [stocklists] = useState<Stocklist[]>(initialStocklists)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStocklist, setSelectedStocklist] = useState<Stocklist | null>(null)
  
  // Quick filters
  const filtered = stocklists.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.facility.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
            Stocklists Preset Templates
          </h2>
          <p className="text-muted-foreground mt-1">
            Preset lists of required installation inventory and baseline quantities for specific engineering projects.
          </p>
        </div>
        <Button className="rounded-xl shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Create Stocklist
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-background/40 backdrop-blur-sm p-4 rounded-2xl border border-white/5 shadow-sm">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stocklists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background/50 rounded-xl"
          />
        </div>
      </div>

      {/* Grid of Stocklists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((list) => (
          <Card key={list.id} className="rounded-3xl border-white/10 glass-card hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className={
                  list.urgency === "High" 
                    ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" 
                    : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                }>
                  {list.urgency} Priority
                </Badge>
                <span className="text-[10px] text-muted-foreground font-mono">{list.id}</span>
              </div>
              <CardTitle className="text-lg font-bold tracking-tight text-foreground mt-3">{list.name}</CardTitle>
              <CardDescription className="text-xs">{list.facility}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs">
                <span className="text-muted-foreground font-semibold flex items-center gap-1">
                  <ListChecks className="h-4 w-4 text-primary" />
                  {list.itemsCount} Items Configured
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedStocklist(list)} className="rounded-xl h-8 border-white/10 text-xs">
                    <Eye className="h-3 w-3 mr-1" /> View Items
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stocklist details drawer dialog */}
      <Dialog open={!!selectedStocklist} onOpenChange={() => setSelectedStocklist(null)}>
        <DialogContent className="sm:max-w-[550px] rounded-3xl border-white/10 glass-card">
          {selectedStocklist && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  <DialogTitle className="text-xl font-bold">{selectedStocklist.name}</DialogTitle>
                </div>
                <DialogDescription>
                  Fulfillment levels required at <span className="font-semibold text-foreground">{selectedStocklist.facility}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="my-4 overflow-x-auto rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-background/40 border-b border-white/10 text-muted-foreground uppercase font-bold tracking-wider">
                      <th className="p-3">SKU</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3 text-right">Target Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedStocklist.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="p-3 font-mono text-muted-foreground">{item.sku}</td>
                        <td className="p-3 font-semibold text-foreground">{item.name}</td>
                        <td className="p-3 text-right font-bold text-primary">
                          {item.targetQty} <span className="text-[10px] text-muted-foreground font-normal">{item.uom}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" onClick={() => setSelectedStocklist(null)} className="rounded-xl">
                  Close Detail
                </Button>
                <Button className="rounded-xl">
                  <ShoppingCart className="h-4 w-4 mr-2" /> Request Replenish
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
