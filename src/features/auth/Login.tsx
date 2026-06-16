import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { API_BASE_URL } from "@/config"
import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
})

type LoginForm = z.infer<typeof loginSchema>
type ForgotForm = z.infer<typeof forgotSchema>

export function Login() {
  const login = useAuthStore((state) => state.login)
  const [view, setView] = useState<"login" | "forgot">("login")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Forgot Password states
  const [isForgotLoading, setIsForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null)
  const [forgotError, setForgotError] = useState<string | null>(null)
  const [forgotLink, setForgotLink] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: forgotErrors },
    reset: resetForgot,
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: data.email,
        password: data.password,
      })

      if (response.data && response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data

        // Fetch user roles
        let role = "ADMIN"
        try {
          const rolesResponse = await axios.get(`${API_BASE_URL}/users/${user.uid}/roles`, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          })
          if (rolesResponse.data && Array.isArray(rolesResponse.data.data) && rolesResponse.data.data.length > 0) {
            role = rolesResponse.data.data[0].name
          }
        } catch (roleError) {
          console.warn("Failed to fetch user roles, using default ADMIN role:", roleError)
        }

        login(
          {
            id: user.uid,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: role
          },
          accessToken,
          refreshToken
        )
      } else {
        setError(response.data?.message || "Login failed")
      }
    } catch (err: any) {
      console.error("Login API error:", err)
      const message = err.response?.data?.message || err.message || "An unexpected error occurred. Please try again."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const onForgotSubmit = async (data: ForgotForm) => {
    setIsForgotLoading(true)
    setForgotError(null)
    setForgotSuccess(null)
    setForgotLink(null)
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email: data.email,
      })
      
      setForgotSuccess(response.data?.message || "If the email exists, a password reset link has been sent.")
      if (response.data?.data?.resetLink) {
        setForgotLink(response.data.data.resetLink)
      }
      resetForgot()
    } catch (err: any) {
      console.error("Forgot Password error:", err)
      setForgotError(err.response?.data?.message || err.message || "Something went wrong. Please try again.")
    } finally {
      setIsForgotLoading(false)
    }
  }

  if (view === "forgot") {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent font-sans">Reset Password</h2>
          <p className="text-sm text-muted-foreground">Enter your email and we'll send you a password recovery link</p>
        </div>

        {forgotSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm px-4 py-3 rounded-xl mb-4 text-center animate-in fade-in slide-in-from-top-2 font-medium">
            {forgotSuccess}
          </div>
        )}

        {forgotLink && (
          <div className="bg-primary/10 border border-primary/20 text-foreground text-sm px-4 py-4 rounded-xl mb-4 text-center animate-in fade-in slide-in-from-top-2">
            <p className="font-semibold text-primary mb-1 text-xs uppercase tracking-wider">Development Mail Simulation</p>
            <p className="text-muted-foreground text-xs mb-3">Since SMTP is disabled, click below to open the generated link:</p>
            <a 
              href={forgotLink} 
              className="inline-flex items-center justify-center w-full h-10 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              Go to Reset Password Page
            </a>
          </div>
        )}

        {forgotError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl mb-4 text-center animate-in fade-in slide-in-from-top-2 font-medium">
            {forgotError}
          </div>
        )}

        <form onSubmit={handleSubmitForgot(onForgotSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="forgot-email" className="font-semibold text-foreground/90 text-sm">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/80" />
              <Input
                id="forgot-email"
                type="email"
                placeholder="admin@fireplansystems.com"
                {...registerForgot("email")}
                className={`h-12 pl-12 pr-4 shadow-sm bg-muted/40 border-muted-foreground/10 rounded-xl transition-all focus:bg-background ${forgotErrors.email ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary focus-visible:border-primary"}`}
              />
            </div>
            {forgotErrors.email && (
              <p className="text-xs text-destructive font-medium animate-in slide-in-from-top-1">{forgotErrors.email.message}</p>
            )}
          </div>

          <Button
            className="w-full h-12 mt-6 text-base font-semibold shadow-md bg-gradient-to-r from-primary to-orange-600 hover:from-primary/95 hover:to-orange-600/95 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
            type="submit"
            disabled={isForgotLoading}
          >
            {isForgotLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting...
              </span>
            ) : (
              "Submit"
            )}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground font-semibold">
          <button
            type="button"
            onClick={() => {
              setView("login")
              setForgotError(null)
              setForgotSuccess(null)
            }}
            className="text-primary hover:underline hover:text-primary/80 transition-colors cursor-pointer"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent font-sans">Welcome back</h2>
        <p className="text-sm text-muted-foreground">Please sign in to access your dashboard</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl mb-4 text-center animate-in fade-in slide-in-from-top-2 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="font-semibold text-foreground/90 text-sm">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/80" />
            <Input
              id="email"
              type="email"
              placeholder="admin@fireplansystems.com"
              {...register("email")}
              className={`h-12 pl-12 pr-4 shadow-sm bg-muted/40 border-muted-foreground/10 rounded-xl transition-all focus:bg-background ${errors.email ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary focus-visible:border-primary"}`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive font-medium animate-in slide-in-from-top-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="font-semibold text-foreground/90 text-sm">
              Password
            </Label>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/80" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className={`h-12 pl-12 pr-10 shadow-sm bg-muted/40 border-muted-foreground/10 rounded-xl transition-all focus:bg-background ${errors.password ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary focus-visible:border-primary"}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/75 hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive font-medium animate-in slide-in-from-top-1">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm mt-2">
          <label className="flex items-center gap-2 cursor-pointer group text-muted-foreground hover:text-foreground transition-colors">
            <input type="checkbox" className="accent-primary h-4 w-4 rounded border-muted-foreground/30 text-primary focus:ring-primary" />
            <span className="select-none font-medium">Keep me signed in</span>
          </label>
          <button
            type="button"
            onClick={() => {
              setView("forgot")
              setError(null)
            }}
            className="font-semibold text-primary hover:text-primary/80 hover:underline transition-colors cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

        <Button
          className="w-full h-12 mt-6 text-base font-semibold shadow-md bg-gradient-to-r from-primary to-orange-600 hover:from-primary/95 hover:to-orange-600/95 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Need help accessing your account?{" "}
        <a href="#" className="font-semibold text-primary hover:underline hover:text-primary/80 transition-colors">
          Contact IT Support
        </a>
      </div>
    </div>
  )
}
