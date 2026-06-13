import { useState } from "react"
import { useWarehouseStore } from "@/store/useWarehouseStore"
import { 
  User, 
  Bell, 
  Database, 
  RotateCcw, 
  Building2, 
  Plus, 
  Trash2, 
  Phone, 
  Mail, 
  FileCheck,
  Building,
  Briefcase,
  Search,
  LayoutGrid,
  List,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// Zod validation schemas
const facilitySchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters").toUpperCase(),
  name: z.string().min(3, "Name must be at least 3 characters"),
  type: z.enum(["Warehouse", "Laboratory", "Filling Station"]),
  location: z.string().min(5, "Location must be at least 5 characters"),
  manager: z.string().min(3, "Manager name must be at least 3 characters"),
})

const supplierSchema = z.object({
  name: z.string().min(3, "Supplier name must be at least 3 characters"),
  contactPerson: z.string().min(3, "Contact person must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(8, "Phone number must be at least 8 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Please enter a valid GSTIN format (e.g. 27AAFCH8829F1Z9)"),
})

const zoneSchema = z.object({
  name: z.string().min(3, "Zone name must be at least 3 characters"),
})

const binSchema = z.object({
  code: z.string().min(2, "Bin code must be at least 2 characters").toUpperCase(),
})

const categorySchema = z.object({
  name: z.string().min(3, "Category name must be at least 3 characters"),
})

const uomSchema = z.object({
  name: z.string().min(2, "UOM name must be at least 2 characters"),
})

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
  profileName: "Fireplan Admin",
  profileEmail: "admin@fireplansystems.com",
  defaultWarehouseId: "WH-001",
  lowStockThreshold: 20,
  autoSku: true,
  notifyLowStock: true,
  notifyInbound: true,
  notifyApproval: true,
}

export function SettingsPage() {
  const { 
    warehouses, suppliers, zones, binLocations, categories, uoms,
    addWarehouse, removeWarehouse, addSupplier, removeSupplier,
    addZone, removeZone, addBin, removeBin,
    addCategory, removeCategory, addUom, removeUom
  } = useWarehouseStore()
  
  const [activeSubTab, setActiveSubTab] = useState<"Profile" | "Facility" | "Layout" | "Supplier" | "Master" | "System">("Profile")
  
  // Modals state
  const [isFacOpen, setIsFacOpen] = useState(false)
  const [isSupOpen, setIsSupOpen] = useState(false)

  // Layout editor state
  const [selectedLayoutWarehouseId, setSelectedLayoutWarehouseId] = useState(warehouses[0]?.id || "")
  const [selectedZoneId, setSelectedZoneId] = useState("")

  // Search states
  const [facSearch, setFacSearch] = useState("")
  const [supSearch, setSupSearch] = useState("")

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem("ob_system_settings_fire")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return defaultSettings
      }
    }
    return defaultSettings
  })

  // React Hook Forms
  const {
    register: registerFac,
    handleSubmit: handleSubmitFac,
    reset: resetFac,
    formState: { errors: errorsFac },
  } = useForm({
    resolver: zodResolver(facilitySchema),
  })

  const {
    register: registerSup,
    handleSubmit: handleSubmitSup,
    reset: resetSup,
    formState: { errors: errorsSup },
  } = useForm({
    resolver: zodResolver(supplierSchema),
  })

  const {
    register: registerZone,
    handleSubmit: handleSubmitZone,
    reset: resetZone,
    formState: { errors: errorsZone },
  } = useForm({
    resolver: zodResolver(zoneSchema),
  })

  const {
    register: registerBin,
    handleSubmit: handleSubmitBin,
    reset: resetBin,
    formState: { errors: errorsBin },
  } = useForm({
    resolver: zodResolver(binSchema),
  })

  const {
    register: registerCat,
    handleSubmit: handleSubmitCat,
    reset: resetCat,
    formState: { errors: errorsCat },
  } = useForm({
    resolver: zodResolver(categorySchema),
  })

  const {
    register: registerUom,
    handleSubmit: handleSubmitUom,
    reset: resetUom,
    formState: { errors: errorsUom },
  } = useForm({
    resolver: zodResolver(uomSchema),
  })

  // System settings state

  const handleResetDb = () => {
    if (confirm("Are you sure you want to restore all database items to factory defaults? This resets all inventory, layouts, purchase orders, suppliers, and project allocations.")) {
      localStorage.removeItem("ob_products_fire")
      localStorage.removeItem("ob_warehouses_fire")
      localStorage.removeItem("ob_inventory_fire")
      localStorage.removeItem("ob_requisitions_fire")
      localStorage.removeItem("ob_shipments_fire")
      localStorage.removeItem("ob_purchase_orders_fire")
      localStorage.removeItem("ob_projects_fire")
      localStorage.removeItem("ob_suppliers_fire")
      localStorage.removeItem("ob_zones_fire")
      localStorage.removeItem("ob_bins_fire")
      localStorage.removeItem("ob_categories_fire")
      localStorage.removeItem("ob_uoms_fire")
      localStorage.removeItem("ob_system_settings_fire")
      window.location.reload()
    }
  }

  // Submission Handlers
  const onFacSubmit = (data: z.infer<typeof facilitySchema>) => {
    addWarehouse({ ...data, status: "Active" })
    setIsFacOpen(false)
    resetFac()
  }

  const onSupSubmit = (data: z.infer<typeof supplierSchema>) => {
    addSupplier(data)
    setIsSupOpen(false)
    resetSup()
  }

  const onZoneSubmit = (data: z.infer<typeof zoneSchema>) => {
    if (!selectedLayoutWarehouseId) return
    addZone(selectedLayoutWarehouseId, data.name)
    resetZone()
  }

  const onBinSubmit = (data: z.infer<typeof binSchema>) => {
    if (!selectedLayoutWarehouseId || !selectedZoneId) return
    addBin(selectedLayoutWarehouseId, selectedZoneId, data.code)
    resetBin()
  }

  const onCatSubmit = (data: z.infer<typeof categorySchema>) => {
    addCategory(data.name)
    resetCat()
  }

  const onUomSubmit = (data: z.infer<typeof uomSchema>) => {
    addUom(data.name)
    resetUom()
  }

  // Filters
  const filteredWarehouses = warehouses.filter((w) => 
    w.name.toLowerCase().includes(facSearch.toLowerCase()) || 
    w.code.toLowerCase().includes(facSearch.toLowerCase()) ||
    w.location.toLowerCase().includes(facSearch.toLowerCase())
  )

  const filteredSuppliers = suppliers.filter((s) => 
    s.name.toLowerCase().includes(supSearch.toLowerCase()) || 
    s.contactPerson.toLowerCase().includes(supSearch.toLowerCase()) ||
    s.gstin.toLowerCase().includes(supSearch.toLowerCase())
  )

  // Layout Filters
  const warehouseZones = zones.filter((z) => z.warehouseId === selectedLayoutWarehouseId)
  const zoneBins = binLocations.filter((b) => b.warehouseId === selectedLayoutWarehouseId && b.zoneId === selectedZoneId)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
            System Preferences
          </h2>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Configure default corporate setups, warehouses, layout zoning structure, approved supplier directory, and master lists.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Left Side Subtabs */}
        <div className="md:col-span-1 flex flex-row md:flex-col flex-wrap gap-2 bg-background/20 p-2.5 rounded-2xl border border-white/5 h-fit shadow-inner">
          <button
            onClick={() => setActiveSubTab("Profile")}
            className={`w-auto md:w-full shrink-0 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
              activeSubTab === "Profile"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" /> Corporate Profile
          </button>
          <button
            onClick={() => setActiveSubTab("Facility")}
            className={`w-auto md:w-full shrink-0 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
              activeSubTab === "Facility"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            <Building2 className="h-4 w-4" /> Facilities
          </button>
          <button
            onClick={() => setActiveSubTab("Layout")}
            className={`w-auto md:w-full shrink-0 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
              activeSubTab === "Layout"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-4 w-4" /> Zones & Layouts
          </button>
          <button
            onClick={() => setActiveSubTab("Supplier")}
            className={`w-auto md:w-full shrink-0 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
              activeSubTab === "Supplier"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            <Briefcase className="h-4 w-4" /> Approved Suppliers
          </button>
          <button
            onClick={() => setActiveSubTab("Master")}
            className={`w-auto md:w-full shrink-0 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
              activeSubTab === "Master"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            <List className="h-4 w-4" /> Master Lists
          </button>
          <button
            onClick={() => setActiveSubTab("System")}
            className={`w-auto md:w-full shrink-0 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
              activeSubTab === "System"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            <Database className="h-4 w-4" /> System Setup
          </button>
        </div>

        {/* Right Side Cards */}
        <div className="md:col-span-3">
          
          {/* Subtab 1: Profile & Corporate Details */}
          {activeSubTab === "Profile" && (
            <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl p-6 space-y-6">
              <div>
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" /> Profile Credentials
                  </CardTitle>
                  <CardDescription>
                    Configure personnel identity credentials saved to logistics audit receipts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="profName">Display Name</Label>
                      <Input
                        id="profName"
                        value={settings.profileName}
                        onChange={(e) => setSettings({ ...settings, profileName: e.target.value })}
                        className="rounded-xl bg-background/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="profEmail">Personnel Email</Label>
                      <Input
                        id="profEmail"
                        value={settings.profileEmail}
                        onChange={(e) => setSettings({ ...settings, profileEmail: e.target.value })}
                        className="rounded-xl bg-background/50"
                      />
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="border-t border-white/5 pt-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" /> Organization Profile
                  </CardTitle>
                  <CardDescription>
                    Registered legal entity credentials for Fireplan Systems & Projects.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0 space-y-4 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground font-semibold">Legal Entity Name</span>
                      <div className="font-bold text-foreground">Fireplan Systems & Projects Pvt. Ltd.</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground font-semibold">GSTIN Registration</span>
                      <div className="font-mono font-bold text-primary">27AAFCD1094F1Z3</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground font-semibold">Corporate Identity No (CIN)</span>
                      <div className="font-mono text-foreground font-semibold">U29193PN2015PTC155490</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground font-semibold">Registered Head Office</span>
                      <div className="text-foreground">Senapati Bapat Road, Shivajinagar, Pune - 411016</div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          )}

          {/* Subtab 2: Warehouses & Facilities */}
          {activeSubTab === "Facility" && (
            <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" /> Warehouses & Storage Facilities
                  </CardTitle>
                  <CardDescription>
                    Manage physical engineering storage depots, warehouses, and labs.
                  </CardDescription>
                </div>
                <Button onClick={() => { resetFac(); setIsFacOpen(true); }} size="sm" className="w-full sm:w-auto rounded-xl mt-2 sm:mt-0">
                  <Plus className="h-4 w-4 mr-1.5" /> Add Facility
                </Button>
              </div>

              {/* Search */}
              <div className="relative w-full max-w-sm mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search storage facilities..."
                  value={facSearch}
                  onChange={(e) => setFacSearch(e.target.value)}
                  className="pl-9 bg-background/40 rounded-xl h-9 text-xs"
                />
              </div>

              {/* Facilities List Table */}
              <div className="rounded-xl border border-white/5 bg-background/20 overflow-hidden mt-4">
                <table className="w-full text-left border-collapse text-xs hidden md:table">
                  <thead>
                    <tr className="border-b border-white/10 text-muted-foreground uppercase bg-background/40 font-semibold">
                      <th className="p-3">Code / Name</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Location Address</th>
                      <th className="p-3">Manager</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredWarehouses.map((wh) => (
                      <tr key={wh.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-foreground">{wh.name}</div>
                          <div className="font-mono text-[10px] text-muted-foreground mt-0.5">{wh.code}</div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="rounded-md font-bold">{wh.type}</Badge>
                        </td>
                        <td className="p-3 text-muted-foreground max-w-xs truncate">{wh.location}</td>
                        <td className="p-3 font-semibold text-foreground">{wh.manager}</td>
                        <td className="p-3 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={warehouses.length <= 1} // Prevent removing all warehouses
                            onClick={() => {
                              if (confirm(`Remove storage facility "${wh.name}"? This action does not delete stock, but removes it from routes.`)) {
                                removeWarehouse(wh.id)
                              }
                            }}
                            className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredWarehouses.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground italic">
                          No matching storage facilities found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                
                {/* Mobile / Tablet Grid View */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:hidden">
                  {filteredWarehouses.map((wh) => (
                    <div key={wh.id} className="bg-background/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3 transition-colors hover:bg-white/5">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-foreground">{wh.name}</div>
                          <div className="font-mono text-[10px] text-muted-foreground mt-0.5">{wh.code}</div>
                        </div>
                        <Badge variant="outline" className="rounded-md font-bold shrink-0 ml-2">{wh.type}</Badge>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="text-muted-foreground"><span className="font-semibold text-foreground/80">Location:</span> {wh.location}</div>
                        <div className="text-muted-foreground"><span className="font-semibold text-foreground/80">Manager:</span> {wh.manager}</div>
                      </div>
                      <div className="flex justify-end pt-2 border-t border-white/5">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={warehouses.length <= 1}
                          onClick={() => {
                            if (confirm(`Remove storage facility "${wh.name}"? This action does not delete stock, but removes it from routes.`)) {
                              removeWarehouse(wh.id)
                            }
                          }}
                          className="h-8 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" /> Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredWarehouses.length === 0 && (
                    <div className="col-span-full py-8 text-center text-muted-foreground italic text-xs">
                      No matching storage facilities found.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Subtab 3: Zones & Bins Layout Editor */}
          {activeSubTab === "Layout" && (
            <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <LayoutGrid className="h-5 w-5 text-primary" /> Warehouse Zones & Bins Layout
                  </CardTitle>
                  <CardDescription>
                    Configure physical layouts (aisles, racks, bays, shelves) for each facility.
                  </CardDescription>
                </div>
                
                {/* Depot selector */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                  <Label htmlFor="layoutWhSelect" className="text-xs shrink-0 font-bold mb-1 sm:mb-0">Active Facility:</Label>
                  <select
                    id="layoutWhSelect"
                    value={selectedLayoutWarehouseId}
                    onChange={(e) => {
                      setSelectedLayoutWarehouseId(e.target.value)
                      setSelectedZoneId("")
                    }}
                    className="h-9 px-3 rounded-xl border border-input bg-background/50 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Column 1: Zones list & Addition */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block">1. Zones / Aisles List</span>
                  
                  {/* Add Zone inline Form */}
                  <form onSubmit={handleSubmitZone(onZoneSubmit)} className="flex gap-2">
                    <Input
                      placeholder="e.g. Zone A - Light Spares"
                      {...registerZone("name")}
                      className="h-9 text-xs rounded-xl"
                    />
                    <Button type="submit" size="sm" className="rounded-xl h-9">
                      <Plus className="h-4 w-4" /> Add
                    </Button>
                  </form>
                  {errorsZone.name && <p className="text-[10px] text-rose-500">{errorsZone.name.message?.toString()}</p>}

                  {/* List */}
                  <div className="rounded-xl border border-white/5 bg-background/25 overflow-hidden max-h-[300px] overflow-y-auto">
                    {warehouseZones.map((z) => (
                      <div
                        key={z.id}
                        onClick={() => setSelectedZoneId(z.id)}
                        className={`flex items-center justify-between p-3 border-b border-white/5 cursor-pointer transition-colors ${
                          selectedZoneId === z.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-white/5"
                        }`}
                      >
                        <span className="text-xs">{z.name}</span>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <ChevronRight className={`h-4 w-4 opacity-50 ${selectedZoneId === z.id ? "text-primary opacity-100" : ""}`} />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm(`Delete zone "${z.name}"? This removes all shelf bins inside it.`)) {
                                removeZone(z.id)
                                if (selectedZoneId === z.id) setSelectedZoneId("")
                              }
                            }}
                            className="h-6 w-6 text-rose-500 hover:bg-rose-500/10 rounded-md"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {warehouseZones.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground italic text-xs">
                        No storage zones created yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Bins list & Addition */}
                <div className="space-y-4 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 pl-0 md:pl-6">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block">2. Shelf Bins in Selected Zone</span>
                  
                  {selectedZoneId ? (
                    <>
                      {/* Add Bin inline Form */}
                      <form onSubmit={handleSubmitBin(onBinSubmit)} className="flex gap-2">
                        <Input
                          placeholder="e.g. BIN-A-01"
                          {...registerBin("code")}
                          className="h-9 text-xs rounded-xl font-mono uppercase"
                        />
                        <Button type="submit" size="sm" className="rounded-xl h-9">
                          <Plus className="h-4 w-4" /> Add Bin
                        </Button>
                      </form>
                      {errorsBin.code && <p className="text-[10px] text-rose-500">{errorsBin.code.message?.toString()}</p>}

                      {/* Bins List */}
                      <div className="rounded-xl border border-white/5 bg-background/25 overflow-hidden max-h-[300px] overflow-y-auto">
                        {zoneBins.map((b) => (
                          <div key={b.id} className="flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5">
                            <span className="font-mono text-xs font-bold text-foreground">{b.code}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm(`Remove bin location "${b.code}"?`)) {
                                  removeBin(b.id)
                                }
                              }}
                              className="h-6 w-6 text-rose-500 hover:bg-rose-500/10 rounded-md"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}

                        {zoneBins.length === 0 && (
                          <div className="p-8 text-center text-muted-foreground italic text-xs">
                            No bins configured inside this zone. Add one above.
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-xs text-muted-foreground bg-background/10 rounded-xl border border-dashed border-white/10 italic">
                      Select a storage zone from the list to manage shelf bins.
                    </div>
                  )}
                </div>

              </div>
            </Card>
          )}

          {/* Subtab 4: Approved Suppliers */}
          {activeSubTab === "Supplier" && (
            <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" /> Approved Suppliers Directory
                  </CardTitle>
                  <CardDescription>
                    Manage certified raw materials manufacturers and supplier organizations.
                  </CardDescription>
                </div>
                <Button onClick={() => { resetSup(); setIsSupOpen(true); }} size="sm" className="w-full sm:w-auto rounded-xl mt-2 sm:mt-0">
                  <Plus className="h-4 w-4 mr-1.5" /> Add Supplier
                </Button>
              </div>

              {/* Search */}
              <div className="relative w-full max-w-sm mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search suppliers or GSTIN..."
                  value={supSearch}
                  onChange={(e) => setSupSearch(e.target.value)}
                  className="pl-9 bg-background/40 rounded-xl h-9 text-xs"
                />
              </div>

              {/* Suppliers List Table */}
              <div className="rounded-xl border border-white/5 bg-background/20 overflow-hidden mt-4">
                <table className="w-full text-left border-collapse text-xs hidden md:table">
                  <thead>
                    <tr className="border-b border-white/10 text-muted-foreground uppercase bg-background/40 font-semibold">
                      <th className="p-3">Supplier Name</th>
                      <th className="p-3">GSTIN ID</th>
                      <th className="p-3">Contact Person</th>
                      <th className="p-3">Communication Channel</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredSuppliers.map((sup) => (
                      <tr key={sup.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-foreground">{sup.name}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 max-w-[200px] truncate">{sup.address}</div>
                        </td>
                        <td className="p-3 font-mono text-primary font-bold">{sup.gstin}</td>
                        <td className="p-3 font-semibold text-foreground">{sup.contactPerson}</td>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex flex-col gap-0.5">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3 shrink-0" /> {sup.email}</span>
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3 shrink-0" /> {sup.phone}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm(`Remove supplier "${sup.name}" from approved vendors?`)) {
                                removeSupplier(sup.id)
                              }
                            }}
                            className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredSuppliers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground italic">
                          No approved suppliers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                
                {/* Mobile / Tablet Grid View */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:hidden">
                  {filteredSuppliers.map((sup) => (
                    <div key={sup.id} className="bg-background/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3 transition-colors hover:bg-white/5">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-foreground truncate">{sup.name}</div>
                          <div className="font-mono text-[10px] text-primary font-bold mt-0.5">{sup.gstin}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Remove supplier "${sup.name}" from approved vendors?`)) {
                              removeSupplier(sup.id)
                            }
                          }}
                          className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="text-muted-foreground"><span className="font-semibold text-foreground/80">Contact:</span> {sup.contactPerson}</div>
                        <div className="text-muted-foreground"><span className="font-semibold text-foreground/80">Address:</span> {sup.address}</div>
                      </div>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground border-t border-white/5 pt-2">
                        <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 shrink-0" /> {sup.email}</span>
                        <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 shrink-0" /> {sup.phone}</span>
                      </div>
                    </div>
                  ))}
                  {filteredSuppliers.length === 0 && (
                    <div className="col-span-full py-8 text-center text-muted-foreground italic text-xs">
                      No approved suppliers found.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Subtab 5: Master Data Managers */}
          {activeSubTab === "Master" && (
            <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl p-6 space-y-6">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <List className="h-5 w-5 text-primary" /> Master Data Catalogs
                </CardTitle>
                <CardDescription>
                  Configure product categories and units of measure globally.
                </CardDescription>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Category Master */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block">1. Categories Master</span>
                  
                  {/* Inline Form */}
                  <form onSubmit={handleSubmitCat(onCatSubmit)} className="flex gap-2">
                    <Input
                      placeholder="e.g. Alarms"
                      {...registerCat("name")}
                      className="h-9 text-xs rounded-xl"
                    />
                    <Button type="submit" size="sm" className="rounded-xl h-9">
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </form>
                  {errorsCat.name && <p className="text-[10px] text-rose-500">{errorsCat.name.message?.toString()}</p>}

                  {/* List */}
                  <div className="rounded-xl border border-white/5 bg-background/25 overflow-hidden max-h-[300px] overflow-y-auto">
                    {categories.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5">
                        <span className="text-xs font-bold">{c.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={categories.length <= 1}
                          onClick={() => {
                            if (confirm(`Remove product category "${c.name}"?`)) {
                              removeCategory(c.id)
                            }
                          }}
                          className="h-6 w-6 text-rose-500 hover:bg-rose-500/10 rounded-md"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* UOM Master */}
                <div className="space-y-4 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 pl-0 md:pl-6">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block">2. Units of Measure Master</span>
                  
                  {/* Inline Form */}
                  <form onSubmit={handleSubmitUom(onUomSubmit)} className="flex gap-2">
                    <Input
                      placeholder="e.g. Roll"
                      {...registerUom("name")}
                      className="h-9 text-xs rounded-xl"
                    />
                    <Button type="submit" size="sm" className="rounded-xl h-9">
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </form>
                  {errorsUom.name && <p className="text-[10px] text-rose-500">{errorsUom.name.message?.toString()}</p>}

                  {/* List */}
                  <div className="rounded-xl border border-white/5 bg-background/25 overflow-hidden max-h-[300px] overflow-y-auto">
                    {uoms.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5">
                        <span className="text-xs font-bold">{u.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={uoms.length <= 1}
                          onClick={() => {
                            if (confirm(`Remove Unit of Measure "${u.name}"?`)) {
                              removeUom(u.id)
                            }
                          }}
                          className="h-6 w-6 text-rose-500 hover:bg-rose-500/10 rounded-md"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </Card>
          )}

          {/* Subtab 6: System Preferences & Reset */}
          {activeSubTab === "System" && (
            <div className="space-y-6">
              <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl p-6 space-y-4">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" /> Low Stock Notification Channels
                  </CardTitle>
                  <CardDescription>
                    Receive alerts and warnings for logistics updates.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-white/5">
                    <div className="space-y-1.5">
                      <Label htmlFor="defWh">Default Warehouse Depot</Label>
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
                      <Label htmlFor="lowStock">Low Stock Alarm limit (Units)</Label>
                      <Input
                        id="lowStock"
                        type="number"
                        value={settings.lowStockThreshold}
                        onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
                        className="rounded-xl bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="notLow"
                      checked={settings.notifyLowStock}
                      onChange={(e) => setSettings({ ...settings, notifyLowStock: e.target.checked })}
                      className="mt-0.5 shrink-0 h-4 w-4 rounded border-white/20 bg-background/50 accent-primary cursor-pointer"
                    />
                    <Label htmlFor="notLow" className="text-sm cursor-pointer leading-tight">Email when a product falls below Minimum stock level</Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="notInb"
                      checked={settings.notifyInbound}
                      onChange={(e) => setSettings({ ...settings, notifyInbound: e.target.checked })}
                      className="mt-0.5 shrink-0 h-4 w-4 rounded border-white/20 bg-background/50 accent-primary cursor-pointer"
                    />
                    <Label htmlFor="notInb" className="text-sm cursor-pointer leading-tight">Email on receiving a new Inbound shipment receipt</Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="notApp"
                      checked={settings.notifyApproval}
                      onChange={(e) => setSettings({ ...settings, notifyApproval: e.target.checked })}
                      className="mt-0.5 shrink-0 h-4 w-4 rounded border-white/20 bg-background/50 accent-primary cursor-pointer"
                    />
                    <Label htmlFor="notApp" className="text-sm cursor-pointer leading-tight">Email when an internal requisition requires manager approval</Label>
                  </div>
                </CardContent>
              </Card>

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

      {/* Dialog: Add Facility */}
      <Dialog open={isFacOpen} onOpenChange={setIsFacOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl border-white/10 glass-card">
          <form onSubmit={handleSubmitFac(onFacSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Add Storage Facility Depot</DialogTitle>
              <DialogDescription>
                Add a new warehouse, Laboratory, or filling station to Fireplan WMS tracking.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="code" className="text-xs font-semibold">Short Code *</Label>
                  <Input
                    id="code"
                    placeholder="e.g. CPY"
                    {...registerFac("code")}
                    className="rounded-xl"
                  />
                  {errorsFac.code && <p className="text-[10px] text-rose-500 font-medium">{errorsFac.code.message?.toString()}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-xs font-semibold">Facility Type *</Label>
                  <select
                    id="type"
                    {...registerFac("type")}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Warehouse">Warehouse</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Filling Station">Filling Station</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold">Depot Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Pune Heavy Piping Warehouse"
                  {...registerFac("name")}
                  className="rounded-xl"
                />
                {errorsFac.name && <p className="text-[10px] text-rose-500 font-medium">{errorsFac.name.message?.toString()}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs font-semibold">Location / Postal Address *</Label>
                <Input
                  id="location"
                  placeholder="e.g. Bhosari Industrial Area, Pune"
                  {...registerFac("location")}
                  className="rounded-xl"
                />
                {errorsFac.location && <p className="text-[10px] text-rose-500 font-medium">{errorsFac.location.message?.toString()}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="manager" className="text-xs font-semibold">Assign Warehouse Manager *</Label>
                <Input
                  id="manager"
                  placeholder="e.g. Amit Patil"
                  {...registerFac("manager")}
                  className="rounded-xl"
                />
                {errorsFac.manager && <p className="text-[10px] text-rose-500 font-medium">{errorsFac.manager.message?.toString()}</p>}
              </div>
            </div>

            <DialogFooter className="pt-2 flex-col sm:flex-row gap-2 sm:gap-0 w-full sm:w-auto mt-4">
              <Button type="button" variant="ghost" onClick={() => setIsFacOpen(false)} className="rounded-xl text-xs w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl text-xs w-full sm:w-auto">
                <FileCheck className="h-4 w-4 mr-1.5" /> Save Facility
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Add Supplier */}
      <Dialog open={isSupOpen} onOpenChange={setIsSupOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl border-white/10 glass-card">
          <form onSubmit={handleSubmitSup(onSupSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Register Approved Supplier Partner</DialogTitle>
              <DialogDescription>
                Add a new certified logistics manufacturer or suppliers to the directory.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="supName" className="text-xs font-semibold">Supplier Name *</Label>
                  <Input
                    id="supName"
                    placeholder="e.g. HD Fire Protect Pvt. Ltd."
                    {...registerSup("name")}
                    className="rounded-xl"
                  />
                  {errorsSup.name && <p className="text-[10px] text-rose-500 font-medium">{errorsSup.name.message?.toString()}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gstin" className="text-xs font-semibold">GSTIN ID *</Label>
                  <Input
                    id="gstin"
                    placeholder="e.g. 27AAFCH8829F1Z9"
                    {...registerSup("gstin")}
                    className="rounded-xl font-mono uppercase"
                  />
                  {errorsSup.gstin && <p className="text-[10px] text-rose-500 font-medium">{errorsSup.gstin.message?.toString()}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contactPerson" className="text-xs font-semibold">Supplier Contact Representative *</Label>
                <Input
                  id="contactPerson"
                  placeholder="e.g. Rajesh Mehta"
                  {...registerSup("contactPerson")}
                  className="rounded-xl"
                />
                {errorsSup.contactPerson && <p className="text-[10px] text-rose-500 font-medium">{errorsSup.contactPerson.message?.toString()}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold">Official Email Address *</Label>
                  <Input
                    id="email"
                    placeholder="e.g. sales@hdfire.com"
                    {...registerSup("email")}
                    className="rounded-xl"
                  />
                  {errorsSup.email && <p className="text-[10px] text-rose-500 font-medium">{errorsSup.email.message?.toString()}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="e.g. +91 22 2682 4000"
                    {...registerSup("phone")}
                    className="rounded-xl"
                  />
                  {errorsSup.phone && <p className="text-[10px] text-rose-500 font-medium">{errorsSup.phone.message?.toString()}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs font-semibold">Registered Vendor Address *</Label>
                <Input
                  id="address"
                  placeholder="e.g. Kemp Plaza, Malad West, Mumbai"
                  {...registerSup("address")}
                  className="rounded-xl"
                />
                {errorsSup.address && <p className="text-[10px] text-rose-500 font-medium">{errorsSup.address.message?.toString()}</p>}
              </div>
            </div>

            <DialogFooter className="pt-2 flex-col sm:flex-row gap-2 sm:gap-0 w-full sm:w-auto mt-4">
              <Button type="button" variant="ghost" onClick={() => setIsSupOpen(false)} className="rounded-xl text-xs w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl text-xs w-full sm:w-auto">
                <FileCheck className="h-4 w-4 mr-1.5" /> Register Supplier
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
