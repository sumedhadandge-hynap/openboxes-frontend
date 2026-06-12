import { useState } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
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
  const { warehouses, selectedWarehouseId, setSelectedWarehouseId } = useWarehouseStore()
  const activeWarehouse = warehouses.find((w) => w.id === selectedWarehouseId)

  const handleLogout = () => {
    setSelectedWarehouseId(null)
    logout()
  }

  const isAccessControlActive = pathname.startsWith("/users") || pathname.startsWith("/roles") || pathname.startsWith("/permissions")
  const [isAccessControlOpen, setIsAccessControlOpen] = useState(isAccessControlActive)

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
    { name: "Warehouses & Facilities", href: "/warehouses", icon: Warehouse },
    { name: "Reports & Charts", href: "/reports", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  if (!selectedWarehouseId) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-background via-background/95 to-primary/10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-orange-500/5 blur-[120px]" />

        <div className="w-full max-w-4xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/30 animate-pulse mx-auto mb-4">
              <Flame className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Welcome to Fireplan WMS
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Please select an active facility or warehouse to begin managing inventory, orders, and dispatches.
            </p>
          </div>

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
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              className="text-xs text-muted-foreground hover:text-destructive rounded-xl"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5 mr-2" /> Log out of Fireplan
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full relative overflow-hidden bg-transparent">
      {/* Floating Sidebar */}
      <aside className="fixed inset-y-4 left-4 z-20 hidden w-[260px] flex-col rounded-3xl glass sm:flex overflow-hidden">
        <div className="flex h-20 items-center px-6 mt-2">
          <Link to="/" className="flex items-center gap-3 font-bold text-xl tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 animate-pulse">
              <Flame className="h-6 w-6" />
            </div>
            <span>Fireplan<span className="text-primary">WMS</span></span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide">
          <div className="space-y-1">
            <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Core</p>
            
            {/* Overview link */}
            <Link
              to="/dashboard"
              className={`group flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-300 ${
                pathname.startsWith("/dashboard") 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3 font-medium">
                <LayoutDashboard className={`h-5 w-5 ${pathname.startsWith("/dashboard") ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary transition-colors"}`} />
                Dashboard
              </div>
              {pathname.startsWith("/dashboard") && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse" />}
            </Link>

            {/* Access Control (Collapsible Group) */}
            <div className="space-y-1">
              <button
                onClick={() => setIsAccessControlOpen(!isAccessControlOpen)}
                className={`w-full group flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-300 text-left ${
                  isAccessControlActive && !isAccessControlOpen
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3 font-medium">
                  <ShieldCheck className={`h-5 w-5 ${isAccessControlActive ? "text-primary" : "text-muted-foreground group-hover:text-primary transition-colors"}`} />
                  <span>Access Control</span>
                </div>
                {isAccessControlOpen ? (
                  <ChevronDown className="h-4 w-4 opacity-75" />
                ) : (
                  <ChevronRight className="h-4 w-4 opacity-75" />
                )}
              </button>

              {/* Collapsed/Expanded Sub-menu */}
              {isAccessControlOpen && (
                <div className="pl-4 space-y-1 mt-1 border-l border-border/60 ml-6 animate-in slide-in-from-top-2 duration-200">
                  <Link
                    to="/users"
                    className={`group flex items-center justify-between rounded-xl px-3 py-2 transition-all duration-300 ${
                      pathname.startsWith("/users")
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-sm">
                      <Users className={`h-4 w-4 ${pathname.startsWith("/users") ? "text-primary" : "text-muted-foreground"}`} />
                      Directory
                    </div>
                  </Link>

                  <Link
                    to="/roles"
                    className={`group flex items-center justify-between rounded-xl px-3 py-2 transition-all duration-300 ${
                      pathname.startsWith("/roles")
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-sm">
                      <ShieldCheck className={`h-4 w-4 ${pathname.startsWith("/roles") ? "text-primary" : "text-muted-foreground"}`} />
                      Roles
                    </div>
                  </Link>

                  <Link
                    to="/permissions"
                    className={`group flex items-center justify-between rounded-xl px-3 py-2 transition-all duration-300 ${
                      pathname.startsWith("/permissions")
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-sm">
                      <Key className={`h-4 w-4 ${pathname.startsWith("/permissions") ? "text-primary" : "text-muted-foreground"}`} />
                      Permissions
                    </div>
                  </Link>
                </div>
              )}
            </div>
            
            <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-8 mb-4">Operations</p>
            {operationsNavigation.map((item) => {
              const isActive = item.href === "/inventory"
                ? pathname === "/inventory"
                : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center justify-between rounded-xl px-4 py-2 transition-all duration-200 ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-bold" 
                      : "text-muted-foreground hover:bg-muted/85 hover:text-foreground text-sm font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`h-4.5 w-4.5 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary transition-colors"}`} />
                    {item.name}
                  </div>
                </Link>
              )
            })}
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
      
      {/* Main Content Area */}
      <div className="flex flex-col w-full sm:pl-[290px] pt-4 pr-4 pb-4 h-screen">
        {/* Floating Top Bar */}
        <header className="z-10 flex h-16 items-center justify-between gap-4 rounded-3xl glass px-6 mb-6 shadow-sm">
          <div className="flex items-center gap-4 sm:hidden">
            <Button variant="outline" size="icon" className="rounded-xl border-white/20">
              <Menu className="h-5 w-5" />
            </Button>
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
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                className="bg-transparent border-none text-foreground font-bold focus:outline-none focus:ring-0 cursor-pointer pr-1 text-xs appearance-none"
              >
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
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
