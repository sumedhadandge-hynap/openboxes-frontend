import axios from "axios"
import type { Role } from "@/types/roles"
import { RoleType } from "@/types/roles"

const API_URL = "http://localhost:5000/api/roles"

// Default roles to populate LocalStorage if API fails and storage is empty
const defaultRoles: Role[] = [
  {
    id: "1",
    name: "Admin",
    roleType: RoleType.ROLE_ADMIN,
    description: "Superuser with full administrative access to all systems, users, inventory, and configurations.",
    usersCount: 2,
  },
  {
    id: "2",
    name: "Manager",
    roleType: RoleType.ROLE_MANAGER,
    description: "Manages catalog products, warehouse facilities, and logistics. Can view users and directory details.",
    usersCount: 3,
  },
  {
    id: "3",
    name: "Warehouse Clerk",
    roleType: RoleType.ROLE_SHIPMENT_CLERK,
    description: "Responsible for daily stock receipts, inventory counts, and packing logistics shipments.",
    usersCount: 6,
  },
  {
    id: "4",
    name: "Viewer",
    roleType: RoleType.ROLE_BROWSER,
    description: "Standard analytical access to view stock levels, warehouses, and product catalogs.",
    usersCount: 1,
  },
]

// Fallback LocalStorage CRUD helpers
const getLocalRoles = (): Role[] => {
  const saved = localStorage.getItem("openboxes_roles")
  if (!saved) {
    localStorage.setItem("openboxes_roles", JSON.stringify(defaultRoles))
    return defaultRoles
  }
  try {
    const parsed = JSON.parse(saved)
    if (Array.isArray(parsed)) {
      return parsed
    }
    localStorage.setItem("openboxes_roles", JSON.stringify(defaultRoles))
    return defaultRoles
  } catch {
    return defaultRoles
  }
}

const saveLocalRoles = (roles: Role[]) => {
  localStorage.setItem("openboxes_roles", JSON.stringify(roles))
}

export const getRoles = async (): Promise<Role[]> => {
  try {
    const response = await axios.get(API_URL)
    let rolesData: any[] = []
    if (response.data && Array.isArray(response.data.data)) {
      rolesData = response.data.data
    } else if (Array.isArray(response.data)) {
      rolesData = response.data
    } else {
      throw new Error("API returned non-array data")
    }
    return rolesData.map((role) => ({
      ...role,
      id: role.uid || role.id,
      uid: role.uid || role.id,
    }))
  } catch (error) {
    console.warn("Roles API GET failed, using LocalStorage fallback:", error)
    return getLocalRoles().map((role) => ({
      ...role,
      uid: role.id,
    }))
  }
}

export const createRole = async (role: Omit<Role, "id" | "usersCount">): Promise<Role> => {
  try {
    const response = await axios.post(API_URL, role)
    return response.data
  } catch (error) {
    console.warn("Roles API POST failed, using LocalStorage fallback:", error)
    const localRoles = getLocalRoles()
    const newRole: Role = {
      ...role,
      id: Math.random().toString(36).substr(2, 9),
      usersCount: 0,
    }
    saveLocalRoles([...localRoles, newRole])
    return newRole
  }
}

export const updateRole = async (role: Role): Promise<Role> => {
  try {
    const response = await axios.put(`${API_URL}/${role.id}`, role)
    return response.data
  } catch (error) {
    console.warn("Roles API PUT failed, using LocalStorage fallback:", error)
    const localRoles = getLocalRoles()
    const updatedRoles = localRoles.map((r) => (r.id === role.id ? role : r))
    saveLocalRoles(updatedRoles)
    return role
  }
}

export const deleteRole = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`)
  } catch (error) {
    console.warn("Roles API DELETE failed, using LocalStorage fallback:", error)
    const localRoles = getLocalRoles()
    const updatedRoles = localRoles.filter((r) => r.id !== id)
    saveLocalRoles(updatedRoles)
  }
}
