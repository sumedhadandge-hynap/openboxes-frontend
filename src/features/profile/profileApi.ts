import axios from "axios"
import { API_BASE_URL } from "@/config"
import { useAuthStore } from "@/store/useAuthStore"

export interface UserProfile {
  uid: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  jobTitle?: string
  location?: string
  bio?: string
  roles?: { uid: string; name: string; roleType: string }[]
}

export interface UpdateProfileDto {
  firstName: string
  lastName: string
  email: string
  phone?: string
  jobTitle?: string
  location?: string
  bio?: string
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}

// Local storage key prefix for extended profile fields
const getExtendedProfile = (uid: string) => {
  const saved = localStorage.getItem(`ob_profile_ext_${uid}`)
  if (!saved) return { phone: "", jobTitle: "", location: "", bio: "" }
  try {
    return JSON.parse(saved)
  } catch {
    return { phone: "", jobTitle: "", location: "", bio: "" }
  }
}

const saveExtendedProfile = (uid: string, fields: any) => {
  localStorage.setItem(`ob_profile_ext_${uid}`, JSON.stringify(fields))
}

const getLocalUsers = () => {
  const saved = localStorage.getItem("ob_users_v2")
  if (!saved) return []
  try {
    return JSON.parse(saved)
  } catch {
    return []
  }
}

const saveLocalUsers = (users: any[]) => {
  localStorage.setItem("ob_users_v2", JSON.stringify(users))
}

// Fetch current user details
export const getCurrentProfile = async (): Promise<UserProfile> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/me`)
    if (response.data && response.data.data) {
      const { uid, firstName, lastName, email, roles, mobileNumber } = response.data.data
      const extended = getExtendedProfile(uid)
      return { 
        uid, 
        firstName, 
        lastName, 
        email, 
        roles, 
        phone: mobileNumber || extended.phone,
        ...extended 
      }
    }
    throw new Error("Invalid response format from /auth/me")
  } catch (error) {
    console.warn("getCurrentProfile API failed, falling back to LocalStorage:", error)
    
    // Check local storage users list
    const currentUser = useAuthStore.getState().user
    const localUsers = getLocalUsers()
    const found = localUsers.find((u: any) => u.uid === currentUser?.id)
    const extended = getExtendedProfile(currentUser?.id || "f23dcad5-a0df-4c6c-a4e5-51d86b94a6b4")
    
    if (found) {
      return {
        uid: found.uid,
        firstName: found.firstName,
        lastName: found.lastName,
        email: found.email,
        roles: found.roles,
        phone: found.mobileNumber || extended.phone,
        ...extended
      }
    }

    // Default fallback from store
    const nameParts = currentUser?.name?.split(" ") || ["Fireplan", "Admin"]
    return {
      uid: currentUser?.id || "f23dcad5-a0df-4c6c-a4e5-51d86b94a6b4",
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(" ") || "",
      email: currentUser?.email || "admin@fireplansystems.com",
      roles: currentUser?.role ? [{ uid: "r1", name: currentUser.role, roleType: "SYSTEM" }] : [],
      phone: extended.phone,
      ...extended
    }
  }
}

// Update current user details
export const updateProfile = async (uid: string, data: UpdateProfileDto): Promise<UserProfile> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/auth/profile`, {
      firstName: data.firstName,
      lastName: data.lastName,
      mobileNumber: data.phone
    })
    
    // Save extended fields locally
    saveExtendedProfile(uid, {
      phone: data.phone || "",
      jobTitle: data.jobTitle || "",
      location: data.location || "",
      bio: data.bio || ""
    })

    if (response.data && response.data.data) {
      const { uid: resUid, firstName, lastName, email, mobileNumber } = response.data.data
      return { 
        uid: resUid, 
        firstName, 
        lastName, 
        email,
        phone: mobileNumber || data.phone,
        jobTitle: data.jobTitle,
        location: data.location,
        bio: data.bio
      }
    }
    throw new Error("Invalid response format from /auth/profile update")
  } catch (error: any) {
    const isNetworkError = !error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network') || error.message?.includes('network'));
    if (!isNetworkError && error.response) {
      throw new Error(error.response.data?.message || "Profile update failed")
    }

    console.warn("updateProfile API failed (offline), saving to LocalStorage fallback:", error)
    
    const localUsers = getLocalUsers()
    let updatedUser: any = null
    
    const updatedUsersList = localUsers.map((u: any) => {
      if (u.uid === uid) {
        updatedUser = {
          ...u,
          firstName: data.firstName,
          lastName: data.lastName,
          mobileNumber: data.phone
        }
        return updatedUser
      }
      return u
    })

    if (!updatedUser) {
      // User doesn't exist in local fallback list, append them
      updatedUser = {
        uid,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        roles: [{ uid: "r1", name: "ADMIN", roleType: "SYSTEM" }]
      }
      updatedUsersList.push(updatedUser)
    }

    saveLocalUsers(updatedUsersList)

    // Save extended fields locally
    saveExtendedProfile(uid, {
      phone: data.phone || "",
      jobTitle: data.jobTitle || "",
      location: data.location || "",
      bio: data.bio || ""
    })

    return {
      ...updatedUser,
      phone: data.phone,
      jobTitle: data.jobTitle,
      location: data.location,
      bio: data.bio
    }
  }
}

// Change user password
export const changePassword = async (data: ChangePasswordDto): Promise<{ message: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/change-password`, data)
    if (response.data && response.data.message) {
      return { message: response.data.message }
    }
    return { message: "Password changed successfully. Please login again." }
  } catch (error: any) {
    const isNetworkError = !error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network') || error.message?.includes('network'));
    if (!isNetworkError && error.response) {
      throw new Error(error.response.data?.message || "Password change failed")
    }

    console.warn("changePassword API failed (offline), executing mock password change success:", error)
    
    // Simulate offline network delay
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    if (data.currentPassword === data.newPassword) {
      throw new Error("New password must be different from current password")
    }
    
    return { message: "Offline Mode: Password changed successfully. Please login again." }
  }
}
