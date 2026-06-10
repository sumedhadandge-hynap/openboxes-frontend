import { Outlet, Link, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Key, 
  Package, 
  Warehouse, 
  Truck, 
  ClipboardList, 
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  Box,
  ChevronRight
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"

export function AppLayout() {
  const { pathname } = useLocation()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Directory", href: "/users", icon: Users },
    { name: "Roles", href: "/roles", icon: ShieldCheck },
    { name: "Permissions", href: "/permissions", icon: Key },
    { name: "Catalog", href: "/products", icon: Package },
    { name: "Inventory", href: "/inventory", icon: Box },
    { name: "Facilities", href: "/warehouses", icon: Warehouse },
    { name: "Logistics", href: "/shipments", icon: Truck },
    { name: "Requests", href: "/requisitions", icon: ClipboardList },
    { name: "Preferences", href: "/settings", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen w-full relative overflow-hidden bg-transparent">
      {/* Floating Sidebar */}
      <aside className="fixed inset-y-4 left-4 z-20 hidden w-[260px] flex-col rounded-3xl glass sm:flex overflow-hidden">
        <div className="flex h-20 items-center px-6 mt-2">
          <Link to="/" className="flex items-center gap-3 font-bold text-xl tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <Package className="h-6 w-6" />
            </div>
            <span>OpenBoxes<span className="text-primary">.</span></span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide">
          <div className="space-y-1">
            <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Core</p>
            {navigation.slice(0, 5).map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-300 ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3 font-medium">
                    <item.icon className={`h-5 w-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary transition-colors"}`} />
                    {item.name}
                  </div>
                  {isActive && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse" />}
                </Link>
              )
            })}
            
            <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-8 mb-4">Operations</p>
            {navigation.slice(5).map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-300 ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3 font-medium">
                    <item.icon className={`h-5 w-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary transition-colors"}`} />
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
                {user?.name?.charAt(0) || "A"}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate">{user?.name || "Admin User"}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.email || "admin@example.com"}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0 hover:bg-destructive/10 hover:text-destructive transition-colors rounded-xl" onClick={logout}>
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
            <span className="font-bold">OpenBoxes.</span>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <span>Workspace</span>
            <ChevronRight className="h-4 w-4 opacity-50" />
            <span className="text-foreground capitalize">{pathname.split('/')[1] || 'Dashboard'}</span>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search everywhere..."
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
