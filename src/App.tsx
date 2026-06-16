import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AppLayout } from "@/layouts/AppLayout"
import { AuthLayout } from "@/layouts/AuthLayout"
import { Dashboard } from "@/features/dashboard/Dashboard"
import { Login } from "@/features/auth/Login"
import ResetPassword from "./pages/auth/ResetPassword"
import { UsersList } from "@/features/users/UsersList"
import { RolesList } from "@/features/roles/RolesList"
import { useAuthStore } from "@/store/useAuthStore"
import { ProductsList } from "@/features/products/ProductsList"
import { ProductDetail } from "@/features/products/ProductDetail"
import { ProductCreate } from "@/features/products/ProductCreate"
import { InventoryList } from "@/features/inventory/InventoryList"
import { InventoryStock } from "@/features/inventory/InventoryStock"
import { WarehousesList } from "@/features/warehouses/WarehousesList"
import { WarehouseDetail } from "@/features/warehouses/WarehouseDetail"
import { ShipmentsList } from "@/features/shipments/ShipmentsList"
import { ShipmentDetail } from "@/features/shipments/ShipmentDetail"
import { ReceiveShipment } from "@/features/shipments/ReceiveShipment"
import { PickPackShipShipment } from "@/features/shipments/PickPackShipment"
import { RequisitionsList } from "@/features/requisitions/RequisitionsList"
import { RequisitionDetail } from "@/features/requisitions/RequisitionDetail"
import { PermissionsList } from "@/features/permissions/PermissionsList"
import { SettingsPage } from "@/features/settings/SettingsPage"
import { ProfilePage } from "@/features/profile/ProfilePage"
import { ReportingPage } from "@/features/reporting/ReportingPage"
import { StocklistsPage } from "@/features/stocklists/StocklistsPage"
import { ProcurementPage } from "@/features/procurement/ProcurementPage"
import { PurchaseOrdersList } from "@/features/procurement/PurchaseOrdersList"
import { GrnPage } from "@/features/inbound/GrnPage"
import { DispatchPage } from "@/features/outbound/DispatchPage"
import { ProjectsPage } from "@/features/projects/ProjectsPage"

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
            <Route path="/reset-password" element={<ResetPassword />} />
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
            <Route path="roles" element={<RolesList />} />
            <Route path="permissions" element={<PermissionsList />} />
            
            <Route path="products" element={<ProductsList />} />
            <Route path="products/create" element={<ProductCreate />} />
            <Route path="products/:id" element={<ProductDetail />} />
            
            <Route path="inventory" element={<InventoryList />} />
            <Route path="inventory/stock" element={<InventoryStock />} />
            
            <Route path="warehouses" element={<WarehousesList />} />
            <Route path="warehouses/:id" element={<WarehouseDetail />} />
            
            <Route path="procurement" element={<ProcurementPage />} />
            <Route path="purchase-orders" element={<PurchaseOrdersList />} />
            <Route path="grn" element={<GrnPage />} />
            <Route path="dispatch" element={<DispatchPage />} />
            <Route path="projects" element={<ProjectsPage />} />

            <Route path="shipments" element={<ShipmentsList />} />
            <Route path="inbound" element={<ShipmentsList key="inbound" defaultType="Inbound" />} />
            <Route path="outbound" element={<ShipmentsList key="outbound" defaultType="Outbound" />} />
            <Route path="shipments/:id" element={<ShipmentDetail />} />
            <Route path="shipments/:id/receive" element={<ReceiveShipment />} />
            <Route path="shipments/:id/pick-pack" element={<PickPackShipShipment />} />
            
            <Route path="reporting" element={<ReportingPage />} />
            <Route path="reports" element={<ReportingPage />} />
            <Route path="stocklists" element={<StocklistsPage />} />
            
            <Route path="requisitions" element={<RequisitionsList />} />
            <Route path="requisitions/:id" element={<RequisitionDetail />} />
            
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
