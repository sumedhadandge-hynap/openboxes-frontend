import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginForm = z.infer<typeof loginSchema>

export function Login() {
  const login = useAuthStore((state) => state.login)
  const [isLoading, setIsLoading] = useState(false)

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
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight mb-2">Log in</h2>
        <p className="text-muted-foreground">Enter your credentials to access the system.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="font-medium text-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@openboxes.com"
            {...register("email")}
            className={`h-12 px-4 shadow-sm transition-all focus:bg-background ${errors.email ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary focus-visible:border-primary"}`}
          />
          {errors.email && (
            <p className="text-xs text-destructive font-medium animate-in slide-in-from-top-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="font-medium text-foreground">
              Password
            </Label>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            className={`h-12 px-4 shadow-sm transition-all focus:bg-background ${errors.password ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary focus-visible:border-primary"}`}
          />
          {errors.password && (
            <p className="text-xs text-destructive font-medium animate-in slide-in-from-top-1">{errors.password.message}</p>
          )}
        </div>

        <Button
          className="w-full h-12 mt-6 text-base font-semibold shadow-sm"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Sign in"}
        </Button>
      </form>

      <div className="mt-8 text-sm text-muted-foreground">
        Need an account?{" "}
        <a href="#" className="font-medium text-foreground hover:text-primary transition-colors underline underline-offset-4">
          Contact IT Support
        </a>
      </div>
    </div>
  )
}
