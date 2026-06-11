import { useState } from "react"
import { BarChart3, TrendingUp, TrendingDown, Calendar, Package, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function ReportingPage() {
  const [timeRange, setTimeRange] = useState("30d")

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
            System Reporting & Analytics
          </h2>
          <p className="text-muted-foreground mt-1">
            Real-time fulfillment metrics, stock accuracy logs, and inbound receipt trends.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted/30 backdrop-blur-sm p-1 rounded-xl border border-white/5">
          <Button
            variant={timeRange === "7d" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTimeRange("7d")}
            className="rounded-lg text-xs"
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === "30d" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTimeRange("30d")}
            className="rounded-lg text-xs"
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === "12m" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTimeRange("12m")}
            className="rounded-lg text-xs"
          >
            12 Months
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-3xl border-white/10 glass-card hover:translate-y-[-2px] transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Order Fill Rate</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">98.4%</span>
              <span className="text-xs text-emerald-500 font-bold flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> +1.2%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Target is 95% minimum</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/10 glass-card hover:translate-y-[-2px] transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Avg. Reception Delay</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">4.2h</span>
              <span className="text-xs text-emerald-500 font-bold flex items-center gap-0.5">
                <TrendingDown className="h-3 w-3 text-emerald-500" /> -15%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">From arrival to putaway</p>
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
              <span className="text-3xl font-extrabold">99.1%</span>
              <span className="text-xs text-emerald-500 font-bold flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> +0.4%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Based on weekly cycle count</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/10 glass-card hover:translate-y-[-2px] transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Discrepant Items</span>
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">3</span>
              <span className="text-xs text-rose-500 font-bold flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> +1
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Requires supervisor audit</p>
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
              Shipment Movement Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 flex flex-col justify-between">
              {/* Chart Grid Lines & Columns */}
              <div className="flex-1 flex items-end justify-between gap-6 pb-2 border-b border-white/10 relative">
                {/* 100% Guideline */}
                <div className="absolute inset-x-0 top-0 border-t border-dashed border-white/5" />
                {/* 50% Guideline */}
                <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-white/5" />

                {/* Bars */}
                {[
                  { label: "Mon", inbound: 40, outbound: 65 },
                  { label: "Tue", inbound: 60, outbound: 50 },
                  { label: "Wed", inbound: 75, outbound: 85 },
                  { label: "Thu", inbound: 55, outbound: 90 },
                  { label: "Fri", inbound: 90, outbound: 70 },
                  { label: "Sat", inbound: 30, outbound: 20 },
                  { label: "Sun", inbound: 15, outbound: 10 },
                ].map((day, idx) => (
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
                ))}
              </div>

              {/* Legends */}
              <div className="flex items-center gap-6 mt-4 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-gradient-to-br from-primary to-orange-400" />
                  <span className="text-muted-foreground">Inbound Shipments (Supplier putaways)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-gradient-to-br from-blue-500 to-sky-400" />
                  <span className="text-muted-foreground">Outbound Shipments (Fulfillments)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Distribution (Pie Chart Placeholder / circular progress) */}
        <Card className="rounded-3xl border-white/10 glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Stock Expiry Risk Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 flex flex-col justify-between">
              <div className="flex-1 flex items-center justify-around">
                {/* SVG Progress Circle for expired */}
                <div className="relative flex items-center justify-center">
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle cx="72" cy="72" r="58" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                    {/* Circle representing Safe (80%) */}
                    <circle
                      cx="72"
                      cy="72"
                      r="58"
                      stroke="url(#safeGradient)"
                      strokeWidth="12"
                      strokeDasharray={2 * Math.PI * 58}
                      strokeDashoffset={2 * Math.PI * 58 * 0.2}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                    <defs>
                      <linearGradient id="safeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-extrabold">80%</span>
                    <span className="text-[10px] text-muted-foreground block font-bold">EXPIRE &gt; 1 YR</span>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    <div>
                      <span className="text-xs font-bold text-foreground">Safe Stock (80%)</span>
                      <p className="text-[10px] text-muted-foreground">Expires in 12+ months</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <div>
                      <span className="text-xs font-bold text-foreground">Near Expiry (15%)</span>
                      <p className="text-[10px] text-muted-foreground">Expires in 3 - 12 months</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-rose-500" />
                    <div>
                      <span className="text-xs font-bold text-foreground">High Risk (5%)</span>
                      <p className="text-[10px] text-muted-foreground">Expires in &lt; 3 months</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs">
                <span className="text-muted-foreground font-semibold">Total Stock Inspected</span>
                <span className="font-bold text-foreground">12,492 Units</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
