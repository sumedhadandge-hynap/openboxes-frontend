import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
  KeyRound,
  Phone,
  LogOut,
  Edit,
  Save
} from "lucide-react"
import { getCurrentProfile, updateProfile, changePassword } from "./profileApi"

// Validation schemas
const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().or(z.literal("")),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export function ProfilePage() {
  const userStore = useAuthStore()
  const updateUserStore = useAuthStore((state) => state.updateUser)
  const logoutStore = useAuthStore((state) => state.logout)

  const [activeTab, setActiveTab] = useState<"details" | "security">("details")
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // Edit / Read-Only states
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)

  // Feedback states
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Password toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Reactive password complexity score
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordInputVal, setPasswordInputVal] = useState("")

  // Profile picture state
  const [profileImage, setProfileImage] = useState<string | null>(null)

  // User detail state from API
  const [userProfile, setUserProfile] = useState<any>(null)

  // React Hook Forms
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  // Load profile details on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoadingProfile(true)
        const profile = await getCurrentProfile()
        setUserProfile(profile)

        // Load custom profile photo from local storage
        const savedImg = localStorage.getItem(`ob_profile_img_${profile.uid}`)
        if (savedImg) {
          setProfileImage(savedImg)
        }

        resetProfile({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone || "",
        })
      } catch (err: any) {
        console.error("Failed to load profile:", err)
        setProfileError("Failed to fetch user profile. Please reload.")
      } finally {
        setIsLoadingProfile(false)
      }
    }

    loadProfile()
  }, [resetProfile])

  // Measure password strength
  const checkPasswordStrength = (val: string) => {
    setPasswordInputVal(val)
    if (!val) {
      setPasswordStrength(0)
      return
    }
    let score = 0
    if (val.length >= 8) score += 1 // Length check
    if (/[A-Z]/.test(val)) score += 1 // Uppercase letter check
    if (/[0-9]/.test(val)) score += 1 // Numeric digit check
    if (/[^A-Za-z0-9]/.test(val)) score += 1 // Special symbol check
    setPasswordStrength(score)
  }

  const getStrengthMeta = () => {
    switch (passwordStrength) {
      case 0: return { label: "None", color: "bg-secondary", text: "text-muted-foreground" }
      case 1: return { label: "Weak", color: "bg-rose-500/80", text: "text-rose-500" }
      case 2: return { label: "Fair", color: "bg-amber-500/80", text: "text-amber-500" }
      case 3: return { label: "Good", color: "bg-orange-500/80", text: "text-orange-500" }
      case 4: return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" }
      default: return { label: "None", color: "bg-secondary", text: "text-muted-foreground" }
    }
  }

  // Handle Profile Picture select/change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && userProfile?.uid) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setProfileImage(base64)
        localStorage.setItem(`ob_profile_img_${userProfile.uid}`, base64)
      }
      reader.readAsDataURL(file)
    }
  }

  // Profile Form submit
  const onProfileSubmit = async (data: ProfileForm) => {
    if (!userProfile?.uid) return
    setIsUpdatingProfile(true)
    setProfileSuccess(null)
    setProfileError(null)

    try {
      const updated = await updateProfile(userProfile.uid, data)
      setUserProfile(updated)

      // Update global auth store state
      updateUserStore({
        name: `${updated.firstName} ${updated.lastName}`,
        email: updated.email,
      })

      setProfileSuccess("Profile updated successfully.")
      setIsEditingProfile(false)
      setTimeout(() => setProfileSuccess(null), 4000)
    } catch (err: any) {
      setProfileError(err.message || "An unexpected error occurred.")
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  // Password Form submit
  const onPasswordSubmit = async (data: PasswordForm) => {
    setIsUpdatingPassword(true)
    setPasswordSuccess(null)
    setPasswordError(null)

    try {
      const res = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })

      setPasswordSuccess(res.message || "Password changed successfully. Logging out...")
      resetPassword()
      setPasswordStrength(0)
      setPasswordInputVal("")
      setIsEditingPassword(false)

      // Force Logout redirect
      setTimeout(async () => {
        await logoutStore()
      }, 2500)
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password. Verify current password.")
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-semibold">Loading profile...</p>
      </div>
    )
  }

  const strengthMeta = getStrengthMeta()

  return (
    <div className="relative min-h-[500px] py-2 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground font-sans">
            Account Profile
          </h2>
          <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
            Configure system configurations, custom profile metadata, and credentials.
          </p>
        </div>

        {/* Sliding Segmented Tab Bar */}
        <div className="relative flex p-1 bg-card border border-white/5 rounded-2xl w-full sm:w-[320px] shadow-lg">
          <div
            className="absolute top-1 bottom-1 rounded-xl bg-primary shadow-md transition-all duration-300 ease-out"
            style={{
              width: "calc(50% - 4px)",
              transform: activeTab === "details" ? "translateX(0)" : "translateX(100%)"
            }}
          />
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`flex-1 relative z-10 py-2 text-xs font-bold transition-colors duration-300 rounded-xl flex items-center justify-center gap-1.5 ${activeTab === "details" ? "text-white" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <User className="h-3.5 w-3.5" /> Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`flex-1 relative z-10 py-2 text-xs font-bold transition-colors duration-300 rounded-xl flex items-center justify-center gap-1.5 ${activeTab === "security" ? "text-white" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Lock className="h-3.5 w-3.5" /> Password
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 relative">

        {/* Profile Identity Card */}
        <div className="md:col-span-1 flex flex-col">
          <Card className="border border-border/60 bg-card/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl relative p-6 flex-1 flex flex-col justify-center items-center">
            <div className="flex flex-col items-center flex-1 justify-between w-full">
              <div className="flex flex-col items-center w-full justify-center flex-1">

                {/* Square Photo Container */}
                <div className="relative h-40 w-60 mb-4 rounded-2xl border border-border/40 overflow-hidden bg-secondary shadow-inner flex items-center justify-center">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-foreground text-6xl font-black select-none">
                      {userProfile?.firstName?.charAt(0) || userStore.user?.name?.charAt(0) || "F"}
                    </span>
                  )}

                  {/* Top-Right Circular Remove Button (translucent gray overlay) */}
                  {isEditingProfile && profileImage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProfileImage(null);
                        localStorage.removeItem(`ob_profile_img_${userProfile.uid}`);
                      }}
                      className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-black/40 hover:bg-black/60 transition-colors flex items-center justify-center text-white backdrop-blur-sm shadow-md z-20 active:scale-95"
                      title="Remove photo"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Upload Action section below the image */}
                {isEditingProfile && (
                  <div className="w-full max-w-[200px] p-2 bg-secondary/30 border border-border/50 rounded-2xl flex justify-center items-center">
                    <Button
                      type="button"
                      onClick={() => document.getElementById("avatar-file-input")?.click()}
                      className="w-full h-9 bg-background hover:bg-muted text-foreground border border-border/80 rounded-xl text-[11px] font-bold shadow-sm transition-all"
                    >
                      Upload Photo
                    </Button>
                    <input
                      id="avatar-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                )}
              </div>

              {/* Unique Logout Button at the bottom of Summary Card */}
              <div className="mt-8 pt-6 border-t border-border/50 w-full">
                <Button
                  onClick={async () => {
                    if (confirm("Are you sure you want to logout?")) {
                      await logoutStore()
                    }
                  }}
                  className="w-full h-11 text-xs font-bold rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-white bg-transparent transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Logout
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Tab Content Cards */}
        <div className="md:col-span-2 relative">

          {/* Active Tab: Details Panel */}
          {activeTab === "details" && (
            <Card className="border border-border/60 bg-card/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all duration-300">
              <CardHeader className="px-0 pt-0 pb-4 flex flex-row flex-wrap items-center justify-between gap-4 border-b border-border/50">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground font-sans">
                    <User className="h-5 w-5 text-primary" /> Profile Details
                  </CardTitle>
                  <CardDescription>
                    Configure display options, corporate contact coordinates, and node details.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {!isEditingProfile && (
                    <Button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="h-10 px-4 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all duration-200 flex items-center gap-1.5 active:scale-[0.98]"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="px-0 pt-6 pb-0">
                {profileSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 font-medium">
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                    {profileSuccess}
                  </div>
                )}

                {profileError && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 font-medium">
                    <XCircle className="h-4.5 w-4.5 shrink-0" />
                    {profileError}
                  </div>
                )}

                <form id="profile-details-form" onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-xs font-bold text-foreground/80">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="Rahul"
                        disabled={!isEditingProfile}
                        {...registerProfile("firstName")}
                        className={`rounded-xl bg-background/30 h-11 border-border/80 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-background transition-all disabled:opacity-60 disabled:cursor-not-allowed ${profileErrors.firstName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                      {profileErrors.firstName && (
                        <p className="text-xs text-destructive font-medium">{profileErrors.firstName.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-xs font-bold text-foreground/80">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Maske"
                        disabled={!isEditingProfile}
                        {...registerProfile("lastName")}
                        className={`rounded-xl bg-background/30 h-11 border-border/80 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-background transition-all disabled:opacity-60 disabled:cursor-not-allowed ${profileErrors.lastName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                      {profileErrors.lastName && (
                        <p className="text-xs text-destructive font-medium">{profileErrors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-bold text-foreground/80">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="rahul@example.com"
                          disabled={!isEditingProfile}
                          {...registerProfile("email")}
                          className={`rounded-xl bg-background/30 h-11 pl-10 border-border/80 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-background transition-all disabled:opacity-60 disabled:cursor-not-allowed ${profileErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                      </div>
                      {profileErrors.email && (
                        <p className="text-xs text-destructive font-medium">{profileErrors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-bold text-foreground/80">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 9876543210"
                          disabled={!isEditingProfile}
                          {...registerProfile("phone")}
                          className="rounded-xl bg-background/30 h-11 pl-10 border-border/80 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-background transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                  {isEditingProfile && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                      <Button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(false)
                          resetProfile({
                            firstName: userProfile?.firstName || "",
                            lastName: userProfile?.lastName || "",
                            email: userProfile?.email || "",
                            phone: userProfile?.phone || "",
                          })
                        }}
                        variant="outline"
                        className="h-10 px-4 text-xs font-bold rounded-xl border border-border text-foreground hover:bg-muted transition-all duration-200 flex items-center gap-1.5"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="h-10 px-4 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all duration-200 flex items-center gap-1.5 active:scale-[0.98]"
                      >
                        {isUpdatingProfile ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-3.5 w-3.5" /> Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          )}

          {/* Active Tab: Security Key Panel */}
          {activeTab === "security" && (
            <Card className="border border-border/60 bg-card/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all duration-300">
              <CardHeader className="px-0 pt-0 pb-4 flex flex-row flex-wrap items-center justify-between gap-4 border-b border-border/50">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground font-sans">
                    <KeyRound className="h-5 w-5 text-primary" /> Password Security
                  </CardTitle>
                  <CardDescription>
                    Configure security settings and passwords to protect your WMS session credentials.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {!isEditingPassword && (
                    <Button
                      type="button"
                      onClick={() => setIsEditingPassword(true)}
                      className="h-10 px-4 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all duration-200 flex items-center gap-1.5 active:scale-[0.98]"
                    >
                      <Edit className="h-3.5 w-3.5" /> Change Password
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="px-0 pt-6 pb-0">
                {passwordSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 font-medium">
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                    {passwordSuccess}
                  </div>
                )}

                {passwordError && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 font-medium">
                    <XCircle className="h-4.5 w-4.5 shrink-0" />
                    {passwordError}
                  </div>
                )}

                <form id="password-security-form" onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="currentPassword" className="text-xs font-bold text-foreground/80">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={!isEditingPassword}
                        {...registerPassword("currentPassword")}
                        className={`rounded-xl bg-background/30 h-11 pl-10 pr-10 border-border/80 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-background transition-all disabled:opacity-60 disabled:cursor-not-allowed ${passwordErrors.currentPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                      {isEditingPassword && (
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/75 hover:text-foreground transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                        </button>
                      )}
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-xs text-destructive font-medium">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="newPassword" className="text-xs font-bold text-foreground/80">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="••••••••"
                          disabled={!isEditingPassword}
                          {...registerPassword("newPassword")}
                          onChange={(e) => {
                            registerPassword("newPassword").onChange(e)
                            checkPasswordStrength(e.target.value)
                          }}
                          className={`rounded-xl bg-background/30 h-11 pl-10 pr-10 border-border/80 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-background transition-all disabled:opacity-60 disabled:cursor-not-allowed ${passwordErrors.newPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                        {isEditingPassword && (
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/75 hover:text-foreground transition-colors"
                          >
                            {showNewPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                          </button>
                        )}
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-xs text-destructive font-medium">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-xs font-bold text-foreground/80">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          disabled={!isEditingPassword}
                          {...registerPassword("confirmPassword")}
                          className={`rounded-xl bg-background/30 h-11 pl-10 pr-10 border-border/80 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-background transition-all disabled:opacity-60 disabled:cursor-not-allowed ${passwordErrors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                        {isEditingPassword && (
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/75 hover:text-foreground transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                          </button>
                        )}
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="text-xs text-destructive font-medium">{passwordErrors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Reactive Password Strength Meter */}
                  {isEditingPassword && passwordInputVal && (
                    <div className="space-y-2 p-3 bg-secondary/20 border border-white/5 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-muted-foreground">Password Complexity:</span>
                        <span className={`font-bold transition-all ${strengthMeta.text}`}>{strengthMeta.label}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 h-1.5">
                        <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength >= 1 ? strengthMeta.color : "bg-secondary/50"}`} />
                        <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength >= 2 ? strengthMeta.color : "bg-secondary/50"}`} />
                        <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength >= 3 ? strengthMeta.color : "bg-secondary/50"}`} />
                        <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength >= 4 ? strengthMeta.color : "bg-secondary/50"}`} />
                      </div>
                      <p className="text-[10px] text-muted-foreground/75 mt-1 font-medium font-sans">
                        For a strong key, include: at least 8 characters, an uppercase letter, a number, and a special character.
                      </p>
                    </div>
                  )}

                  {isEditingPassword && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                      <Button
                        type="button"
                        onClick={() => {
                          setIsEditingPassword(false)
                          resetPassword()
                          setPasswordStrength(0)
                          setPasswordInputVal("")
                        }}
                        variant="outline"
                        className="h-10 px-4 text-xs font-bold rounded-xl border border-border text-foreground hover:bg-muted transition-all duration-200 flex items-center gap-1.5"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="h-10 px-4 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all duration-200 flex items-center gap-1.5 active:scale-[0.98]"
                      >
                        {isUpdatingPassword ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-3.5 w-3.5" /> Save Password
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  )
}
