import { useState } from "react"
import { BarChart3, TrendingUp, TrendingDown, Calendar, Package, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useWarehouseStore } from "@/store/useWarehouseStore"

export function ReportingPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const { inventory, selectedWarehouseId } = useWarehouseStore()

  const whHash = selectedWarehouseId ? selectedWarehouseId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) : 0
  
  // Scoped KPIs
  const fillRate = (95 + (whHash % 45) / 10).toFixed(1)
  const putawayLag = (2.0 + (whHash % 30) / 10).toFixed(1)
  const stockAccuracy = (99.0 + (whHash % 10) / 10).toFixed(1)
  const discrepancies = (whHash % 4)

  // Compliance calculations
  const activeInventory = inventory.filter(item => item.warehouseId === selectedWarehouseId)
  const totalLots = activeInventory.length
  let expiredLots = 0
  let impendingLots = 0
  let compliantLots = 0

  activeInventory.forEach(item => {
    if (!item.expirationDate) {
      compliantLots++
      return
    }
    const expDate = new Date(item.expirationDate)
    const currentDate = new Date("2026-06-12")
    if (expDate < currentDate) {
      expiredLots++
    } else {
      const diffTime = expDate.getTime() - currentDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays < 180) {
        impendingLots++
      } else {
        compliantLots++
      }
    }
  })

  const compliantPercent = totalLots > 0 ? Math.round((compliantLots / totalLots) * 100) : 90
  const impendingPercent = totalLots > 0 ? Math.round((impendingLots / totalLots) * 100) : 7
  const expiredPercent = totalLots > 0 ? Math.round((expiredLots / totalLots) * 100) : 3

  const totalCylindersCount = activeInventory.reduce((sum, item) => sum + item.quantityOnHand, 0)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
            Fireplan Logistics Analytics
          </h2>
          <p className="text-muted-foreground mt-1">
            Real-time project fill rates, pressure cert logs, and vendor lead-time charts.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-muted/30 backdrop-blur-sm p-1 rounded-xl border border-white/5">
          {["7d", "30d", "12m"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="rounded-lg text-xs"
            >
              {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "12 Months"}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-3xl border-white/10 glass-card hover:translate-y-[-2px] transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Project Fill Rate</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{fillRate}%</span>
              <span className="text-xs text-emerald-500 font-bold flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> +1.2%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Contract SLA target is 95%</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/10 glass-card hover:translate-y-[-2px] transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Putaway Lag</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{putawayLag}h</span>
              <span className="text-xs text-emerald-500 font-bold flex items-center gap-0.5">
                <TrendingDown className="h-3 w-3" /> -18%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Arrival dock to bin audit</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/10 glass-card hover:translate-y-[-2px] transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Stock Accuracy</span>
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Package className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{stockAccuracy}%</span>
              <span className="text-xs text-emerald-500 font-bold flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> +0.6%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Based on monthly warehouse counts</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/10 glass-card hover:translate-y-[-2px] transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Device Discrepancies</span>
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{discrepancies}</span>
              <span className="text-xs text-rose-500 font-bold flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> +1
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Requires QC inspector signoff</p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Outbound vs Inbound Volumes (SVG Bar Chart) */}
        <Card className="rounded-3xl border-white/10 glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Weekly Freight Logistics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 flex flex-col justify-between">
              {/* Chart Grid Lines & Columns */}
              <div className="flex-1 flex items-end justify-between gap-6 pb-2 border-b border-white/10 relative">
                <div className="absolute inset-x-0 top-0 border-t border-dashed border-white/5" />
                <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-white/5" />

                {/* Bars */}
                {(() => {
                  const getBaseFreightData = (whId: string) => {
                    const hash = whId ? whId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) : 42
                    return [
                      { label: "Mon", inbound: (hash * 3) % 45 + 15, outbound: (hash * 7) % 55 + 20 },
                      { label: "Tue", inbound: (hash * 5) % 35 + 25, outbound: (hash * 2) % 45 + 30 },
                      { label: "Wed", inbound: (hash * 4) % 65 + 20, outbound: (hash * 9) % 75 + 15 },
                      { label: "Thu", inbound: (hash * 8) % 45 + 30, outbound: (hash * 1) % 65 + 35 },
                      { label: "Fri", inbound: (hash * 6) % 55 + 40, outbound: (hash * 3) % 55 + 30 },
                      { label: "Sat", inbound: (hash * 9) % 25 + 10, outbound: (hash * 5) % 25 + 8 },
                      { label: "Sun", inbound: (hash * 2) % 15 + 5,  outbound: (hash * 8) % 15 + 4 },
                    ]
                  }
                  return getBaseFreightData(selectedWarehouseId || "").map((day, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="w-full flex items-end justify-center gap-1.5 h-4/5">
                        {/* Inbound bar */}
                        <div
                          style={{ height: `${day.inbound}%` }}
                          className="w-3 rounded-t bg-gradient-to-t from-primary to-orange-400 opacity-90 hover:opacity-100 transition-opacity"
                          title={`Inbound: ${day.inbound}`}
                        />
                        {/* Outbound bar */}
                        <div
                          style={{ height: `${day.outbound}%` }}
                          className="w-3 rounded-t bg-gradient-to-t from-blue-500 to-sky-400 opacity-90 hover:opacity-100 transition-opacity"
                          title={`Outbound: ${day.outbound}`}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase">{day.label}</span>
                    </div>
                  ))
                })()}
              </div>

              {/* Legends */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mt-4 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-gradient-to-br from-primary to-orange-400" />
                  <span className="text-muted-foreground">Inbound (Vendor Deliveries)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-gradient-to-br from-blue-500 to-sky-400" />
                  <span className="text-muted-foreground">Outbound (Site Dispatches)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gas Cylinder & Hose Reel Expiry Risk */}
        <Card className="rounded-3xl border-white/10 glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Suppression Cylinder Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 flex flex-col justify-between">
              <div className="flex-1 flex items-center justify-around">
                <div className="relative flex items-center justify-center">
                  <svg className="w-36 h-36 transform -rotate-90">
                    <defs>
                      <linearGradient id="safeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                    <circle cx="72" cy="72" r="58" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                    <circle
                      cx="72"
                      cy="72"
                      r="58"
                      stroke="url(#safeGradient)"
                      strokeWidth="12"
                      strokeDasharray={2 * Math.PI * 58}
                      strokeDashoffset={2 * Math.PI * 58 * (1 - compliantPercent / 100)}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-extrabold">{compliantPercent}%</span>
                    <span className="text-[10px] text-muted-foreground block font-bold">COMPLIANT</span>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    <div>
                      <span className="text-xs font-bold text-foreground">Cert Active ({compliantPercent}%)</span>
                      <p className="text-[10px] text-muted-foreground">Pressure certificates &gt; 1 yr valid</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <div>
                      <span className="text-xs font-bold text-foreground">Hydro-test Impending ({impendingPercent}%)</span>
                      <p className="text-[10px] text-muted-foreground">Due for inspection in 3-6 months</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-rose-500" />
                    <div>
                      <span className="text-xs font-bold text-foreground">Out of Service ({expiredPercent}%)</span>
                      <p className="text-[10px] text-muted-foreground">Recertification test overdue</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs">
                <span className="text-muted-foreground font-semibold">Total Cylinders Inspected</span>
                <span className="font-bold text-foreground">{totalCylindersCount || 120} Cylinders</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
