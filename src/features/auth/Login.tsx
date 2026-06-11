import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginForm = z.infer<typeof loginSchema>

export function Login() {
  const login = useAuthStore((state) => state.login)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      login(
        { id: "1", name: "Admin User", email: data.email, role: "ADMIN" },
        "fake-jwt-token"
      )
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent font-sans">Welcome back</h2>
        <p className="text-sm text-muted-foreground">Please sign in to access your dashboard</p>
      </div>

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
              placeholder="admin@openboxes.com"
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
          <a href="#" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Forgot password?
          </a>
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
