import { useParams, Link } from "react-router-dom"
import { useWarehouseStore } from "@/store/useWarehouseStore"
import { ArrowLeft, Box, Calendar, ClipboardList, MapPin, Tag, Warehouse } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { products, inventory, warehouses } = useWarehouseStore()

  const product = products.find((p) => p.id === id)
  if (!product) {
    return (
      <div className="p-12 text-center">
        <h3 className="text-xl font-bold">Product Not Found</h3>
        <p className="text-muted-foreground mt-2">The requested product could not be found.</p>
        <Link to="/products" className="mt-4 inline-block text-primary hover:underline">
          Back to Catalog
        </Link>
      </div>
    )
  }

  // Get inventory for this product
  const productStock = inventory.filter((item) => item.productId === product.id)
  const totalStock = productStock.reduce((sum, item) => sum + item.quantityOnHand, 0)
  const isLowStock = totalStock < product.minLevel

  // Helper to get warehouse details
  const getWarehouseName = (whId: string) => {
    const wh = warehouses.find((w) => w.id === whId)
    return wh ? `${wh.name} (${wh.code})` : "Unknown Facility"
  }

  // Helper to check if a lot is expired or near expiry
  const getExpiryStatus = (expiryStr: string) => {
    if (!expiryStr) return { label: "No Expiry", color: "text-muted-foreground bg-muted/40" }
    
    const expiryDate = new Date(expiryStr)
    const today = new Date("2026-06-11") // Using standard workspace date anchor
    
    if (expiryDate < today) {
      return { label: "Expired", color: "text-rose-500 bg-rose-500/10 border border-rose-500/20" }
    }

    const sixMonthsLater = new Date(today)
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6)
    if (expiryDate <= sixMonthsLater) {
      return { label: "Expiring Soon", color: "text-amber-500 bg-amber-500/10 border border-amber-500/20" }
    }

    return { label: "Good", color: "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20" }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Link to="/products" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Catalog
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono bg-muted px-2.5 py-1 rounded-lg text-muted-foreground border border-white/5 font-semibold">
                {product.sku}
              </span>
              <Badge variant={product.status === "Active" ? "default" : "secondary"}>
                {product.status}
              </Badge>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mt-2">{product.name}</h2>
            <p className="text-muted-foreground mt-1 text-sm md:text-base max-w-2xl">{product.description}</p>
          </div>
          <div className="bg-background/40 backdrop-blur border border-white/5 p-4 rounded-2xl flex flex-col justify-center min-w-[200px]">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">Total Available Stock</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-4xl font-black ${isLowStock ? "text-rose-500" : "text-emerald-500"}`}>
                {totalStock}
              </span>
              <span className="text-sm text-muted-foreground">{product.unitOfMeasure}s</span>
            </div>
            {isLowStock && (
              <span className="text-xs text-rose-400 font-semibold mt-1">
                Below Minimum Level ({product.minLevel})
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Info Card */}
        <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" /> Product Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-4 w-4" /> Category
              </span>
              <span className="font-bold text-sm">{product.category}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Box className="h-4 w-4" /> Packaging UOM
              </span>
              <span className="font-bold text-sm">{product.unitOfMeasure}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Warehouse className="h-4 w-4" /> Minimum Threshold
              </span>
              <span className="font-bold text-sm">{product.minLevel} units</span>
            </div>
          </CardContent>
        </Card>

        {/* Stock Breakdown Card */}
        <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Inventory Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {productStock.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-muted-foreground uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Warehouse / Facility</th>
                      <th className="pb-3 font-semibold">Lot Number</th>
                      <th className="pb-3 font-semibold">Expiration Date</th>
                      <th className="pb-3 font-semibold">Bin / Shelf</th>
                      <th className="pb-3 font-semibold text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {productStock.map((item) => {
                      const expStatus = getExpiryStatus(item.expirationDate)
                      return (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 font-bold flex items-center gap-2">
                            <Warehouse className="h-4 w-4 text-muted-foreground shrink-0" />
                            {getWarehouseName(item.warehouseId)}
                          </td>
                          <td className="py-3.5 font-mono text-xs font-semibold">{item.lotNumber}</td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{item.expirationDate || "N/A"}</span>
                              {item.expirationDate && (
                                <Badge className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${expStatus.color}`}>
                                  {expStatus.label}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 text-muted-foreground font-semibold">{item.binLocation || "Unassigned"}</td>
                          <td className="py-3.5 text-right font-black text-foreground">
                            {item.quantityOnHand}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground bg-background/20 rounded-2xl border border-dashed border-white/5">
                No active inventory for this product in any warehouse.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
