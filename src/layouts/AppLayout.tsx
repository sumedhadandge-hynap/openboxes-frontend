import { useState } from "react"
import { Outlet, Link, useLocation, Navigate } from "react-router-dom"
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Key, 
  Package, 
  Warehouse, 
  ClipboardList, 
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  Box,
  ChevronRight,
  ChevronDown,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  ListChecks,
  Flame,
  FileSpreadsheet,
  Truck
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { useWarehouseStore } from "@/store/useWarehouseStore"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function AppLayout() {
  const { pathname } = useLocation()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const { warehouses, selectedWarehouseId, setSelectedWarehouseId, addWarehouse } = useWarehouseStore()
  const activeWarehouse = warehouses.find((w) => w.id === selectedWarehouseId)

  // State for creating a new warehouse
  const [newWhCode, setNewWhCode] = useState("")
  const [newWhName, setNewWhName] = useState("")
  const [newWhType, setNewWhType] = useState<"Warehouse" | "Laboratory" | "Filling Station">("Warehouse")
  const [newWhLocation, setNewWhLocation] = useState("")
  const [newWhManager, setNewWhManager] = useState("")
  const [createError, setCreateError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(warehouses.length === 0)

  const handleLogout = () => {
    setSelectedWarehouseId(null)
    logout()
  }

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWhCode || !newWhName || !newWhLocation || !newWhManager) {
      setCreateError("All fields are required.")
      return
    }

    if (warehouses.some((w) => w.code.toUpperCase() === newWhCode.toUpperCase())) {
      setCreateError(`Warehouse with code "${newWhCode.toUpperCase()}" already exists.`)
      return
    }

    const nextId = `WH-${String(warehouses.length + 1).padStart(3, "0")}`

    addWarehouse({
      code: newWhCode.toUpperCase(),
      name: newWhName,
      type: newWhType,
      location: newWhLocation,
      manager: newWhManager,
      status: "Active",
    })

    setSelectedWarehouseId(nextId)

    // Reset state
    setNewWhCode("")
    setNewWhName("")
    setNewWhLocation("")
    setNewWhManager("")
    setCreateError(null)
    setIsCreating(false)
  }

  const isSuperAdmin = user?.role === "SUPER_ADMIN"
  
  // System Administration pages (global, visible only to Super Admin)
  const isGlobalAdminPage = pathname.startsWith("/users") || 
                            pathname.startsWith("/roles") || 
                            pathname.startsWith("/permissions") || 
                            pathname.startsWith("/warehouses") || 
                            pathname.startsWith("/settings")

  if (isGlobalAdminPage && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  const shouldBlockForWarehouse = !selectedWarehouseId && !(isSuperAdmin && isGlobalAdminPage)
  const showSidebar = isSuperAdmin || !shouldBlockForWarehouse

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const adminNavigation = [
    { name: "Users Directory", href: "/users", icon: Users },
    { name: "Roles Configuration", href: "/roles", icon: ShieldCheck },
    { name: "Permissions Matrix", href: "/permissions", icon: Key },
    { name: "Warehouses & Facilities", href: "/warehouses", icon: Warehouse },
    { name: "System Settings", href: "/settings", icon: Settings },
  ]

  const operationsNavigation = [
    { name: "Items & Products", href: "/products", icon: Package },
    { name: "Current Stock Levels", href: "/inventory/stock", icon: Box },
    { name: "Stock Adjustments", href: "/inventory", icon: ClipboardList },
    { name: "Procurement Overview", href: "/procurement", icon: FileSpreadsheet },
    { name: "Supplier Orders (POs)", href: "/purchase-orders", icon: ClipboardList },
    { name: "Inbound & Outbound", href: "/shipments", icon: Truck },
    { name: "Receive Shipments (GRN)", href: "/grn", icon: ArrowDownLeft },
    { name: "Dispatch Materials", href: "/dispatch", icon: ArrowUpRight },
    { name: "Project Materials", href: "/projects", icon: ListChecks },
    { name: "Reports & Charts", href: "/reports", icon: BarChart3 },
  ]

  return (
    <div className="flex min-h-screen w-full relative overflow-hidden bg-transparent">
      {/* Mobile Menu Overlay */}
      {showSidebar && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-10 bg-background/80 backdrop-blur-sm sm:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Floating Sidebar */}
      {showSidebar && (
        <aside className={`fixed inset-y-4 left-4 z-20 w-[260px] flex-col rounded-3xl glass overflow-hidden transition-transform duration-300 ease-in-out sm:flex sm:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0 flex" : "-translate-x-[120%] hidden"
        }`}>
          <div className="flex h-20 items-center px-6 mt-2">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 font-bold text-xl tracking-tight">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 animate-pulse">
                <Flame className="h-6 w-6" />
              </div>
              <span>Fireplan<span className="text-primary">WMS</span></span>
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide">
            <div className="space-y-6">
              {/* Operations Section */}
              <div className="space-y-1">
                <p className="px-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">Operations</p>
                
                {/* Dashboard / Overview Link */}
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`group flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-300 ${
                    pathname.startsWith("/dashboard") 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold" 
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground text-sm font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className={`h-4.5 w-4.5 ${pathname.startsWith("/dashboard") ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary transition-colors"}`} />
                    Dashboard
                  </div>
                </Link>

                {operationsNavigation.map((item) => {
                  const isActive = !!selectedWarehouseId && (item.href === "/inventory"
                    ? pathname === "/inventory"
                    : pathname.startsWith(item.href))
                  
                  if (selectedWarehouseId) {
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center justify-between rounded-xl px-4 py-2.5 transition-all duration-200 ${
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold" 
                            : "text-muted-foreground hover:bg-muted/85 hover:text-foreground text-sm font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`h-4.5 w-4.5 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary transition-colors"}`} />
                          {item.name}
                        </div>
                      </Link>
                    )
                  } else {
                    return null
                  }
                })}
              </div>

              {/* System Admin Section */}
              {isSuperAdmin && (
                <div className="space-y-1">
                  <p className="px-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">System Admin</p>
                  {adminNavigation.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center justify-between rounded-xl px-4 py-2.5 transition-all duration-200 ${
                          isActive 
                            ? "bg-primary/10 text-primary font-semibold border border-primary/20 shadow-sm" 
                            : "text-muted-foreground hover:bg-muted/85 hover:text-foreground text-sm font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`h-4.5 w-4.5 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary transition-colors"}`} />
                          {item.name}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* User Profile Area */}
          <div className="p-4 mt-auto">
            <div className="flex items-center justify-between rounded-2xl bg-muted/50 p-3 backdrop-blur-md border border-white/10">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-orange-400 text-white font-bold shadow-inner">
                  {user?.name?.charAt(0) || "F"}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold truncate">{user?.name || "Fireplan Admin"}</span>
                  <span className="text-xs text-muted-foreground truncate">{user?.email || "admin@fireplansystems.com"}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0 hover:bg-destructive/10 hover:text-destructive transition-colors rounded-xl" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>
      )}
      
      {/* Main Content Area */}
      <div className={`flex flex-col w-full pt-4 pr-4 pb-4 h-screen transition-all duration-300 ${
        showSidebar ? "pl-4 sm:pl-[290px]" : "pl-4"
      }`}>
        {/* Floating Top Bar */}
        <header className="z-10 flex h-16 items-center justify-between gap-4 rounded-3xl glass px-6 mb-6 shadow-sm">
          <div className="flex items-center gap-4 sm:hidden">
            {showSidebar && (
              <Button variant="outline" size="icon" className="rounded-xl border-white/20" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <span className="font-bold flex items-center gap-1.5"><Flame className="h-5 w-5 text-primary" /> Fireplan WMS</span>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <span>Workspace</span>
            <ChevronRight className="h-4 w-4 opacity-50" />
            <span className="text-foreground capitalize mr-2">{pathname.split('/')[1]?.replace("-", " ") || 'Dashboard'}</span>
            
            <ChevronRight className="h-4 w-4 opacity-50" />
            
            <div className="flex items-center gap-2 bg-background/50 border border-white/5 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <Warehouse className="h-4 w-4 text-primary shrink-0" />
              <select
                value={selectedWarehouseId || ""}
                onChange={(e) => setSelectedWarehouseId(e.target.value || null)}
                className="bg-transparent border-none text-foreground font-semibold focus:outline-none focus:ring-0 cursor-pointer pr-1 text-xs appearance-none"
              >
                {!selectedWarehouseId && (
                  <option value="" className="bg-[#18181b] text-white font-semibold">
                    Select Facility...
                  </option>
                )}
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id} className="bg-[#18181b] text-white font-semibold">
                    {wh.code} - {wh.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground opacity-70 shrink-0 pointer-events-none" />
            </div>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder={`Search ${activeWarehouse?.code || "warehouse"} inventory...`}
                className="w-[280px] rounded-full bg-muted/50 border border-white/10 pl-10 pr-4 py-2 text-sm font-medium transition-all focus:w-[320px] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-background"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              </Button>
            </div>
          </div>
        </header>
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto rounded-3xl glass-card p-6 md:p-8 shadow-xl shadow-black/5 scrollbar-hide">
          <div className="mx-auto max-w-6xl">
            {shouldBlockForWarehouse ? (
              <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 py-6">
                <div className="text-center space-y-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/30 animate-pulse mx-auto mb-4">
                    <Flame className="h-10 w-10" />
                  </div>
                  <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                    {isCreating ? "Setup Warehouse / Facility" : "Select Active Warehouse"}
                  </h1>
                  <p className="text-muted-foreground text-base max-w-md mx-auto">
                    {isCreating 
                      ? "Configure a new warehouse facility to begin managing inventory, orders, and dispatches."
                      : "Please select an active facility or warehouse to begin managing logistics."}
                  </p>
                </div>

                {isCreating ? (
                  isSuperAdmin ? (
                    <Card className="border border-white/10 bg-[#1c1c1f]/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-xl mx-auto relative overflow-hidden">
                      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                      <h3 className="text-xl font-bold mb-6 text-foreground text-center">New Facility Details</h3>
                      
                      {createError && (
                        <div className="bg-destructive/10 border border-destructive/25 text-destructive text-sm px-4 py-3 rounded-xl mb-4 text-center">
                          {createError}
                        </div>
                      )}

                      <form onSubmit={handleCreateWarehouse} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label htmlFor="whCode" className="text-xs font-semibold text-foreground/80">Code *</label>
                            <input
                              id="whCode"
                              type="text"
                              placeholder="e.g. CPY"
                              value={newWhCode}
                              onChange={(e) => setNewWhCode(e.target.value)}
                              className="w-full h-10 px-3 rounded-xl border border-white/10 bg-background/50 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label htmlFor="whType" className="text-xs font-semibold text-foreground/80">Facility Type</label>
                            <select
                              id="whType"
                              value={newWhType}
                              onChange={(e) => setNewWhType(e.target.value as any)}
                              className="w-full h-10 px-3 rounded-xl border border-white/10 bg-[#1c1c1f] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            >
                              <option value="Warehouse" className="bg-[#18181b] text-white">Warehouse</option>
                              <option value="Laboratory" className="bg-[#18181b] text-white">Laboratory</option>
                              <option value="Filling Station" className="bg-[#18181b] text-white">Filling Station</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="whName" className="text-xs font-semibold text-foreground/80">Facility Name *</label>
                          <input
                            id="whName"
                            type="text"
                            placeholder="e.g. Central Piping & Heavy Warehouse"
                            value={newWhName}
                            onChange={(e) => setNewWhName(e.target.value)}
                            className="w-full h-11 px-3 rounded-xl border border-white/10 bg-background/50 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="whLocation" className="text-xs font-semibold text-foreground/80">Location Address *</label>
                          <input
                            id="whLocation"
                            type="text"
                            placeholder="e.g. Logistics Zone B, Pune"
                            value={newWhLocation}
                            onChange={(e) => setNewWhLocation(e.target.value)}
                            className="w-full h-11 px-3 rounded-xl border border-white/10 bg-background/50 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="whManager" className="text-xs font-semibold text-foreground/80">Manager Name *</label>
                          <input
                            id="whManager"
                            type="text"
                            placeholder="e.g. Rahul Maske"
                            value={newWhManager}
                            onChange={(e) => setNewWhManager(e.target.value)}
                            className="w-full h-11 px-3 rounded-xl border border-white/10 bg-background/50 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            required
                          />
                        </div>

                        <div className="flex gap-4 mt-6">
                          {warehouses.length > 0 && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setIsCreating(false)
                                setCreateError(null)
                              }}
                              className="flex-1 h-11 text-sm font-semibold rounded-xl border-white/10"
                            >
                              Cancel
                            </Button>
                          )}
                          <Button type="submit" className="flex-1 h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary/95 hover:to-orange-600/95 text-white shadow-lg shadow-primary/20">
                            Create & Select
                          </Button>
                        </div>
                      </form>
                    </Card>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Only Super Administrators can create a new warehouse. Please contact your administrator.</p>
                    </div>
                  )
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {warehouses.map((wh) => (
                      <Card
                        key={wh.id}
                        onClick={() => setSelectedWarehouseId(wh.id)}
                        className="group relative overflow-hidden border border-white/5 bg-background/30 backdrop-blur-md hover:bg-background/60 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer p-6 rounded-3xl"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Warehouse className="h-20 w-20 text-primary" />
                        </div>

                        <span className="text-xs font-mono text-primary font-bold uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-full">
                          {wh.code}
                        </span>
                        
                        <h3 className="font-bold text-lg text-foreground mt-4 group-hover:text-primary transition-colors">
                          {wh.name}
                        </h3>
                        
                        <div className="text-xs text-muted-foreground space-y-1.5 mt-4 border-t border-white/5 pt-3">
                          <div>Type: <span className="font-semibold text-foreground/80">{wh.type}</span></div>
                          <div className="truncate">Location: <span className="font-semibold text-foreground/80">{wh.location}</span></div>
                          <div>Manager: <span className="font-semibold text-foreground/80">{wh.manager}</span></div>
                        </div>
                      </Card>
                    ))}

                    {/* Add Warehouse Card for Super Admin */}
                    {isSuperAdmin && (
                      <Card
                        onClick={() => setIsCreating(true)}
                        className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 bg-transparent hover:bg-background/10 hover:border-primary/40 transition-all duration-300 cursor-pointer p-6 rounded-3xl min-h-[190px]"
                      >
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        </div>
                        <span className="text-sm font-semibold text-foreground">Add New Facility</span>
                        <span className="text-xs text-muted-foreground mt-1 text-center">Configure additional warehouse location</span>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
