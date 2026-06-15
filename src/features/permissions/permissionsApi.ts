import axios from "axios"
import { API_BASE_URL } from "@/config"

export interface SystemPermission {
  uid: string
  name: string
  description: string
  category?: string
}

const BASE_URL = API_BASE_URL

// Default permissions for offline fallback
const fallbackPermissions: SystemPermission[] = [
  { uid: "p1", name: "users:read", description: "Allows users:read" },
  { uid: "p2", name: "users:write", description: "Allows users:write" },
  { uid: "p3", name: "roles:read", description: "Allows roles:read" },
  { uid: "p4", name: "roles:write", description: "Allows roles:write" },
  { uid: "p5", name: "permissions:read", description: "Allows permissions:read" },
  { uid: "p6", name: "permissions:write", description: "Allows permissions:write" },
]

// Default role-permission mapping for fallback
const defaultRolePermissions: Record<string, string[]> = {
  "1": ["p1", "p2", "p3", "p4", "p5", "p6"], // Admin has all
  "2": ["p1", "p3", "p5"],                  // Manager
  "3": ["p1"],                              // Warehouse Clerk
  "4": ["p1"],                              // Viewer
}

const getLocalPermissions = (): SystemPermission[] => {
  const saved = localStorage.getItem("ob_permissions_v2")
  if (!saved) {
    localStorage.setItem("ob_permissions_v2", JSON.stringify(fallbackPermissions))
    return fallbackPermissions
  }
  try {
    return JSON.parse(saved)
  } catch {
    return fallbackPermissions
  }
}

const getLocalRolePermissionsMap = (): Record<string, string[]> => {
  const saved = localStorage.getItem("ob_role_permissions_map_v2")
  if (!saved) {
    localStorage.setItem("ob_role_permissions_map_v2", JSON.stringify(defaultRolePermissions))
    return defaultRolePermissions
  }
  try {
    return JSON.parse(saved)
  } catch {
    return defaultRolePermissions
  }
}

const saveLocalRolePermissionsMap = (map: Record<string, string[]>) => {
  localStorage.setItem("ob_role_permissions_map_v2", JSON.stringify(map))
}

// 1. Get All Permissions
export const getPermissions = async (): Promise<SystemPermission[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/permissions`)
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    return getLocalPermissions()
  } catch (error) {
    console.warn("getPermissions API failed, using LocalStorage fallback:", error)
    return getLocalPermissions()
  }
}

// 2. Get Permissions for a Specific Role
export const getRolePermissions = async (roleUid: string): Promise<SystemPermission[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/roles/${roleUid}/permissions`)
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    throw new Error("Invalid response")
  } catch (error) {
    console.warn(`getRolePermissions for ${roleUid} failed, using LocalStorage fallback:`, error)
    const map = getLocalRolePermissionsMap()
    const assignedIds = map[roleUid] || []
    const allPerms = getLocalPermissions()
    return allPerms.filter((p) => assignedIds.includes(p.uid))
  }
}

// 3. Assign Permission to Role
export const assignRolePermission = async (roleUid: string, permissionUid: string): Promise<void> => {
  try {
    const response = await axios.post(`${BASE_URL}/roles/${roleUid}/permissions`, { permissionUid })
    if (response.data && response.data.statusCode === 201) {
      return
    }
    // Handle 200 OK success if returned
    if (response.data && response.data.success) {
      return
    }
    throw new Error(response.data?.message || "Failed to assign permission")
  } catch (error: any) {
    const isNetworkError = !error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network') || error.message?.includes('network'));
    if (!isNetworkError) {
      throw new Error(error.response?.data?.message || error.message || "Failed to assign permission")
    }

    console.warn("assignRolePermission API failed, using LocalStorage fallback:", error)
    const map = getLocalRolePermissionsMap()
    const current = map[roleUid] || []
    if (!current.includes(permissionUid)) {
      map[roleUid] = [...current, permissionUid]
      saveLocalRolePermissionsMap(map)
    }
  }
}

// 4. Remove Permission from Role
export const removeRolePermission = async (roleUid: string, permissionUid: string): Promise<void> => {
  try {
    const response = await axios.delete(`${BASE_URL}/roles/${roleUid}/permissions/${permissionUid}`)
    if (response.data && response.data.success) {
      return
    }
  } catch (error: any) {
    const isNetworkError = !error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network') || error.message?.includes('network'));
    if (!isNetworkError) {
      throw new Error(error.response?.data?.message || error.message || "Failed to remove permission")
    }

    console.warn("removeRolePermission API failed, using LocalStorage fallback:", error)
    const map = getLocalRolePermissionsMap()
    const current = map[roleUid] || []
    map[roleUid] = current.filter((id) => id !== permissionUid)
    saveLocalRolePermissionsMap(map)
  }
}
