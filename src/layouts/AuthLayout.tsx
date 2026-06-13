import { Outlet, Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { Flame } from "lucide-react"

export function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen w-full bg-background font-sans overflow-x-hidden">

      {/* Left Panel - Premium 3D Background */}
      <div className="relative hidden w-[55%] lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/auth-bg.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <div className="absolute bottom-12 left-12 right-12 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-6">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
            Warehouse Logistics System: Operational
          </div>
          <h1 className="text-5xl font-semibold tracking-tight text-white mb-4 drop-shadow-lg">
            Fire Protection Supply Chain.
          </h1>
          <p className="text-base text-white/80 max-w-xl font-medium drop-shadow-md leading-relaxed">
            The logistics control center for Fireplan Systems & Projects Pvt. Ltd. Coordinate warehouses, track cylinders hydrostatic certs, staging project hardware, and purchase orders.
          </p>
        </div>
      </div>

      {/* Right Panel - Redesigned Section */}
      <div className="relative flex w-full flex-col justify-center items-center bg-gradient-to-br from-background via-muted/40 to-background px-4 py-12 min-h-screen lg:min-h-0 lg:w-[45%] overflow-hidden">
        {/* Decorative Blurred Blobs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-orange-500/5 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="w-full max-w-[440px] z-10">
          <div className="rounded-3xl border border-white/20 dark:border-white/10 bg-card/60 backdrop-blur-xl p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-primary/5">
            {/* Top gradient highlight line */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            
            <div className="flex items-center gap-3 mb-8 justify-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-500 shadow-md shadow-primary/20">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Fireplan<span className="text-primary">WMS</span></span>
            </div>

            <Outlet />
          </div>
          
          <div className="mt-6 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Fireplan Systems & Projects Pvt. Ltd. All rights reserved.
          </div>
        </div>

      </div>

    </div>
  )
}
