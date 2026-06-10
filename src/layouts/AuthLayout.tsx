import { Outlet, Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { Package } from "lucide-react"

export function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen w-full bg-background font-sans overflow-hidden">

      {/* Left Panel - Premium 3D Background */}
      <div className="relative hidden w-[55%] lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/auth-bg.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="absolute bottom-12 left-12 right-12 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-6">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
            System Status: Operational
          </div>
          <h1 className="text-5xl font-semibold tracking-tight text-white mb-4 drop-shadow-lg">
            Intelligent Supply Chain.
          </h1>
          <p className="text-lg text-white/80 max-w-xl font-medium drop-shadow-md">
            The control center for your global inventory. Secure, scalable, and beautifully designed.
          </p>
        </div>
      </div>

      {/* Right Panel - Clean Minimalist Form */}
      <div className="relative flex w-full flex-col justify-center items-center bg-background px-4 lg:w-[45%]">

        <div className="w-full max-w-[400px]">
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">OpenBoxes<span className="text-primary">.</span></span>
          </div>

          <Outlet />
        </div>

      </div>

    </div>
  )
}
