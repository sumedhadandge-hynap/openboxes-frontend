import { useState } from "react"
import { useWarehouseStore } from "@/store/useWarehouseStore"
import { Settings, User, Bell, Database, RotateCcw, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SystemSettings {
  profileName: string
  profileEmail: string
  defaultWarehouseId: string
  lowStockThreshold: number
  autoSku: boolean
  notifyLowStock: boolean
  notifyInbound: boolean
  notifyApproval: boolean
}

const defaultSettings: SystemSettings = {
  profileName: "Admin User",
  profileEmail: "admin@openboxes.com",
  defaultWarehouseId: "WH-001",
  lowStockThreshold: 100,
  autoSku: true,
  notifyLowStock: true,
  notifyInbound: true,
  notifyApproval: true,
}

export function SettingsPage() {
  const { warehouses } = useWarehouseStore()
  const [activeSubTab, setActiveSubTab] = useState<"Profile" | "Facility" | "System">("Profile")
  
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem("ob_system_settings")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return defaultSettings
      }
    }
    return defaultSettings
  })

  const handleSave = () => {
    localStorage.setItem("ob_system_settings", JSON.stringify(settings))
    alert("Settings saved successfully!")
  }

  const handleResetDb = () => {
    if (confirm("Are you sure you want to restore all database items to factory defaults? This resets all inventory, shipments, and requisitions.")) {
      localStorage.removeItem("ob_products")
      localStorage.removeItem("ob_warehouses")
      localStorage.removeItem("ob_inventory")
      localStorage.removeItem("ob_requisitions")
      localStorage.removeItem("ob_shipments")
      localStorage.removeItem("ob_users")
      localStorage.removeItem("ob_role_permissions")
      localStorage.removeItem("ob_system_settings")
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
            System Preferences
          </h2>
          <p className="text-muted-foreground mt-1">
            Customize notification channels, default warehouse facilities, and developer actions.
          </p>
        </div>
        <Button onClick={handleSave} className="rounded-xl shadow-lg shadow-primary/20">
          <Save className="mr-2 h-4 w-4" /> Save Preferences
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Left Side Subtabs */}
        <div className="md:col-span-1 space-y-1 bg-background/20 p-2.5 rounded-2xl border border-white/5 h-fit">
          <button
            onClick={() => setActiveSubTab("Profile")}
            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
              activeSubTab === "Profile"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" /> User Profile
          </button>
          <button
            onClick={() => setActiveSubTab("Facility")}
            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
              activeSubTab === "Facility"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            <Settings className="h-4 w-4" /> Facility Settings
          </button>
          <button
            onClick={() => setActiveSubTab("System")}
            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
              activeSubTab === "System"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            <Database className="h-4 w-4" /> System & Reset
          </button>
        </div>

        {/* Right Side Cards */}
        <div className="md:col-span-3">
          {activeSubTab === "Profile" && (
            <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl p-6 space-y-4">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" /> User Profile Information
                </CardTitle>
                <CardDescription>
                  Modify credentials used to sign documents and logs.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="profName">Full Display Name</Label>
                    <Input
                      id="profName"
                      value={settings.profileName}
                      onChange={(e) => setSettings({ ...settings, profileName: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="profEmail">Email Address</Label>
                    <Input
                      id="profEmail"
                      value={settings.profileEmail}
                      onChange={(e) => setSettings({ ...settings, profileEmail: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSubTab === "Facility" && (
            <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl p-6 space-y-4">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" /> Facility Defaults
                </CardTitle>
                <CardDescription>
                  Configure global warehouse thresholds and defaults.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="defWh">Default Receiving Facility</Label>
                    <select
                      id="defWh"
                      value={settings.defaultWarehouseId}
                      onChange={(e) => setSettings({ ...settings, defaultWarehouseId: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lowStock">Low Stock Threshold Limit</Label>
                    <Input
                      id="lowStock"
                      type="number"
                      value={settings.lowStockThreshold}
                      onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="autoSku"
                    checked={settings.autoSku}
                    onChange={(e) => setSettings({ ...settings, autoSku: e.target.checked })}
                    className="h-4 w-4 rounded border-white/20 bg-background/50 accent-primary cursor-pointer"
                  />
                  <Label htmlFor="autoSku" className="text-sm font-semibold cursor-pointer">
                    Enable Auto-generation of Product SKU Codes
                  </Label>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSubTab === "System" && (
            <div className="space-y-6">
              {/* Notification channels */}
              <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl p-6 space-y-4">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" /> Notification Settings
                  </CardTitle>
                  <CardDescription>
                    Receive alerts and warnings for logistics updates.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0 space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="notLow"
                      checked={settings.notifyLowStock}
                      onChange={(e) => setSettings({ ...settings, notifyLowStock: e.target.checked })}
                      className="h-4 w-4 rounded border-white/20 bg-background/50 accent-primary cursor-pointer"
                    />
                    <Label htmlFor="notLow" className="text-sm cursor-pointer">Email when a product falls below Minimum stock level</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="notInb"
                      checked={settings.notifyInbound}
                      onChange={(e) => setSettings({ ...settings, notifyInbound: e.target.checked })}
                      className="h-4 w-4 rounded border-white/20 bg-background/50 accent-primary cursor-pointer"
                    />
                    <Label htmlFor="notInb" className="text-sm cursor-pointer">Email on receiving a new Inbound shipment receipt</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="notApp"
                      checked={settings.notifyApproval}
                      onChange={(e) => setSettings({ ...settings, notifyApproval: e.target.checked })}
                      className="h-4 w-4 rounded border-white/20 bg-background/50 accent-primary cursor-pointer"
                    />
                    <Label htmlFor="notApp" className="text-sm cursor-pointer">Email when an internal requisition requires manager approval</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Developer Reset tools */}
              <Card className="border border-rose-500/10 bg-rose-500/5 rounded-2xl p-6 space-y-4">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-bold text-rose-500 flex items-center gap-2">
                    <Database className="h-5 w-5" /> Factory Reset Database
                  </CardTitle>
                  <CardDescription>
                    Danger Zone: Resetting wipes all LocalStorage overrides and loads initial clean states.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <Button variant="destructive" onClick={handleResetDb} className="rounded-xl shadow-lg shadow-rose-500/10">
                    <RotateCcw className="mr-2 h-4 w-4" /> Reset Database & Reload
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
