import axios from "axios"

export interface User {
  uid: string
  firstName: string
  lastName: string
  email: string
  temporaryPassword?: string
  roles?: { uid: string; name: string; roleType: string }[]
}

export interface UserRole {
  uid: string
  name: string
  roleType: string
}

const BASE_URL = "http://localhost:5000/api"

// LocalStorage mock fallback data
const fallbackUsers: User[] = [
  { uid: "f23dcad5-a0df-4c6c-a4e5-51d86b94a6b4", firstName: "Rahul", lastName: "Maske", email: "rahul@example.com", roles: [{ uid: "r1", name: "ADMIN", roleType: "SYSTEM" }] },
  { uid: "usr-2", firstName: "Jane", lastName: "Smith", email: "jane@example.com", roles: [{ uid: "r2", name: "MANAGER", roleType: "SYSTEM" }] },
]

const getLocalUsers = (): User[] => {
  const saved = localStorage.getItem("ob_users_v2")
  if (!saved) {
    localStorage.setItem("ob_users_v2", JSON.stringify(fallbackUsers))
    return fallbackUsers
  }
  try {
    return JSON.parse(saved)
  } catch {
    return fallbackUsers
  }
}

const saveLocalUsers = (users: User[]) => {
  localStorage.setItem("ob_users_v2", JSON.stringify(users))
}

// Test 1: Get all users
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/users`)
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    return getLocalUsers()
  } catch (error) {
    console.warn("getUsers API failed, using LocalStorage fallback:", error)
    return getLocalUsers()
  }
}

// Test 2: Create User
export const createUser = async (user: { firstName: string; lastName: string; email: string; roleUid: string }): Promise<User> => {
  try {
    const response = await axios.post(`${BASE_URL}/users`, user)
    if (response.data && response.data.statusCode === 201) {
      if (response.data.data) {
        return response.data.data
      }
    }
    throw new Error(response.data?.message || "Invalid create user response status")
  } catch (error: any) {
    const isNetworkError = !error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network') || error.message?.includes('network'));
    if (!isNetworkError) {
      throw new Error(error.response?.data?.message || error.message || "User creation failed")
    }

    console.warn("createUser API failed (offline), using LocalStorage fallback:", error)
    const localUsers = getLocalUsers()
    const newUser: User = {
      uid: Math.random().toString(36).substring(2, 11),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      temporaryPassword: "Temp@123456",
      roles: []
    }
    const updated = [newUser, ...localUsers]
    saveLocalUsers(updated)
    return newUser
  }
}

// Test 3: Get User details
export const getUser = async (userUid: string): Promise<User> => {
  try {
    const response = await axios.get(`${BASE_URL}/users/${userUid}`)
    if (response.data && response.data.data) {
      return response.data.data
    }
    throw new Error("Not found")
  } catch (error) {
    console.warn("getUser API failed, using LocalStorage fallback:", error)
    const found = getLocalUsers().find((u) => u.uid === userUid)
    if (found) return found
    throw new Error("User not found")
  }
}

// Test 4: Get User Roles
export const getUserRoles = async (userUid: string): Promise<UserRole[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/users/${userUid}/roles`)
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    return []
  } catch (error) {
    console.warn("getUserRoles API failed, using LocalStorage fallback:", error)
    const found = getLocalUsers().find((u) => u.uid === userUid)
    return found?.roles || []
  }
}

// Test 5: Assign Another Role
export const assignUserRole = async (userUid: string, roleUid: string): Promise<void> => {
  try {
    await axios.post(`${BASE_URL}/users/${userUid}/roles`, { roleUid })
  } catch (error) {
    console.warn("assignUserRole API failed, using LocalStorage fallback:", error)
    const localUsers = getLocalUsers()
    const updated = localUsers.map((u) => {
      if (u.uid === userUid) {
        const roles = u.roles || []
        if (!roles.some((r) => r.uid === roleUid)) {
          return {
            ...u,
            roles: [...roles, { uid: roleUid, name: "ASSIGNED_ROLE", roleType: "SYSTEM" }]
          }
        }
      }
      return u
    })
    saveLocalUsers(updated)
  }
}

// Test 6: Remove Role
export const removeUserRole = async (userUid: string, roleUid: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/users/${userUid}/roles/${roleUid}`)
  } catch (error) {
    console.warn("removeUserRole API failed, using LocalStorage fallback:", error)
    const localUsers = getLocalUsers()
    const updated = localUsers.map((u) => {
      if (u.uid === userUid) {
        return {
          ...u,
          roles: (u.roles || []).filter((r) => r.uid !== roleUid)
        }
      }
      return u
    })
    saveLocalUsers(updated)
  }
}
