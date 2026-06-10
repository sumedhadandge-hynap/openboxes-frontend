import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AppLayout } from "@/layouts/AppLayout"
import { AuthLayout } from "@/layouts/AuthLayout"
import { Dashboard } from "@/features/dashboard/Dashboard"
import { Login } from "@/features/auth/Login"
import { UsersList } from "@/features/users/UsersList"
import { useAuthStore } from "@/store/useAuthStore"

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UsersList />} />
            <Route path="roles" element={<div className="p-6">Roles Management</div>} />
            <Route path="permissions" element={<div className="p-6">Permissions Management</div>} />
            <Route path="products" element={<div className="p-6">Products Management</div>} />
            <Route path="inventory" element={<div className="p-6">Inventory Management</div>} />
            <Route path="warehouses" element={<div className="p-6">Warehouses Management</div>} />
            <Route path="shipments" element={<div className="p-6">Shipments</div>} />
            <Route path="requisitions" element={<div className="p-6">Requisitions</div>} />
            <Route path="settings" element={<div className="p-6">Settings</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
