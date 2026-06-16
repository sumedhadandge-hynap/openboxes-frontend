import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { useSearchParams, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "@/config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Lock, Eye, EyeOff } from "lucide-react"

const resetSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type ResetForm = z.infer<typeof resetSchema>

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const token = searchParams.get("token")
  
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  })

  const onSubmit = async (data: ResetForm) => {
    if (!token) {
      setError("Token is missing. Cannot reset password.")
      return
    }
    
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        newPassword: data.newPassword,
      })

      const successMessage = response.data?.data?.message || response.data?.message || "Password reset successfully."
      setSuccess(successMessage)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (err: any) {
      console.error("Reset Password API error:", err)
      const message = err.response?.data?.message || err.message || "Failed to reset password. The link may have expired."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent font-sans">Reset Password</h2>
        <p className="text-sm text-muted-foreground">Please configure your new security credentials below</p>
      </div>

      {!token ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl mb-4 text-center font-medium">
          The reset password token is missing or invalid. Please request a new link.
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl mb-4 text-center animate-in fade-in slide-in-from-top-2 font-medium">
              {error}
            </div>
          )}

          {success && (
            <>
              <style>{`
                @keyframes shrinkProgress {
                  0% { width: 100%; }
                  100% { width: 0%; }
                }
                .animate-progress-bar {
                  animation: shrinkProgress 3s linear forwards;
                }
              `}</style>
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
                <div className="relative w-full max-w-md overflow-hidden bg-background/40 border border-muted-foreground/10 rounded-2xl p-8 shadow-2xl text-center backdrop-blur-xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                  {/* Top decorative glow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Glowing checkmark circle */}
                  <div className="relative mx-auto flex items-center justify-center w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full shadow-lg shadow-emerald-500/10 animate-bounce mb-6">
                    <svg 
                      className="w-8 h-8 animate-in zoom-in-75 duration-500 delay-100" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent font-sans">
                    Success!
                  </h3>
                  <p className="text-base text-foreground/80 font-semibold mb-4">
                    {success}
                  </p>
                  <p className="text-sm text-muted-foreground mb-8">
                    Redirecting you to the sign in page in a moment...
                  </p>

                  {/* Progress bar loader */}
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-full bg-emerald-500 animate-progress-bar rounded-full" />
                  </div>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="font-semibold text-foreground/90 text-sm">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/80" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isLoading || !!success}
                  {...register("newPassword")}
                  className={`h-12 pl-12 pr-10 shadow-sm bg-muted/40 border-muted-foreground/10 rounded-xl transition-all focus:bg-background ${errors.newPassword ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary focus-visible:border-primary"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/75 hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-destructive font-medium animate-in slide-in-from-top-1">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-semibold text-foreground/90 text-sm">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/80" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isLoading || !!success}
                  {...register("confirmPassword")}
                  className={`h-12 pl-12 pr-10 shadow-sm bg-muted/40 border-muted-foreground/10 rounded-xl transition-all focus:bg-background ${errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary focus-visible:border-primary"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/75 hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive font-medium animate-in slide-in-from-top-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              className="w-full h-12 mt-6 text-base font-semibold shadow-md bg-gradient-to-r from-primary to-orange-600 hover:from-primary/95 hover:to-orange-600/95 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
              type="submit"
              disabled={isLoading || !!success}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </>
      )}

      <div className="mt-8 text-center text-sm text-muted-foreground font-semibold">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-primary hover:underline hover:text-primary/80 transition-colors cursor-pointer"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  )
}
