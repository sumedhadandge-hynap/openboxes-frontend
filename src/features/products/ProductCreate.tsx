import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useWarehouseStore } from "@/store/useWarehouseStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Loader2, Sparkles } from "lucide-react"

const productSchema = z.object({
  sku: z.string().min(3, "SKU code must be at least 3 characters").toUpperCase(),
  name: z.string().min(3, "Product name must be at least 3 characters"),
  category: z.string().min(1, "Please select a category"),
  unitOfMeasure: z.string().min(1, "Please select a unit of measure"),
  minLevel: z.coerce.number().min(0, "Minimum level cannot be negative"),
  status: z.enum(["Active", "Inactive"]),
  description: z.string().min(10, "Please provide a description of at least 10 characters"),
})


export function ProductCreate() {
  const navigate = useNavigate()
  const { addProduct, categories, uoms } = useWarehouseStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: "",
      name: "",
      category: categories[0]?.name || "Sprinklers",
      unitOfMeasure: uoms[0]?.name || "Each",
      minLevel: 10,
      status: "Active" as const,
      description: "",
    },
  })

  const onSubmit = (data: z.infer<typeof productSchema>) => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      addProduct(data)
      setIsSubmitting(false)
      navigate("/products")
    }, 1000)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link to="/products">
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
            Create Product Catalog Item
          </h2>
          <p className="text-muted-foreground mt-0.5">
            Add a new fire protection SKU or system component to the active master catalog.
          </p>
        </div>
      </div>

      <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden max-w-2xl relative">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            Product Details
          </CardTitle>
          <CardDescription>
            Ensure SKU codes match corporate catalog naming conventions (e.g. SPR-PEND-68).
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sku" className="font-semibold text-sm">
                  SKU Code *
                </Label>
                <Input
                  id="sku"
                  placeholder="e.g. SPR-PEND-68"
                  {...register("sku")}
                  className={`rounded-xl bg-background/50 focus:bg-background ${errors.sku ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {errors.sku && <p className="text-xs text-destructive font-medium">{errors.sku.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name" className="font-semibold text-sm">
                  Product Name *
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Pendent Fire Sprinkler 68°C"
                  {...register("name")}
                  className={`rounded-xl bg-background/50 focus:bg-background ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="font-semibold text-sm">
                  Category *
                </Label>
                <select
                  id="category"
                  {...register("category")}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                  {categories.length === 0 && (
                    <option value="Sprinklers">Sprinklers</option>
                  )}
                </select>
                {errors.category && <p className="text-xs text-destructive font-medium">{errors.category.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unitOfMeasure" className="font-semibold text-sm">
                  Unit of Measure *
                </Label>
                <select
                  id="unitOfMeasure"
                  {...register("unitOfMeasure")}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background"
                >
                  {uoms.map((uom) => (
                    <option key={uom.id} value={uom.name}>{uom.name}</option>
                  ))}
                  {uoms.length === 0 && (
                    <option value="Each">Each</option>
                  )}
                </select>
                {errors.unitOfMeasure && <p className="text-xs text-destructive font-medium">{errors.unitOfMeasure.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="minLevel" className="font-semibold text-sm">
                  Minimum Stock Threshold *
                </Label>
                <Input
                  id="minLevel"
                  type="number"
                  placeholder="e.g. 50"
                  {...register("minLevel", { valueAsNumber: true })}
                  className={`rounded-xl bg-background/50 focus:bg-background ${errors.minLevel ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {errors.minLevel && <p className="text-xs text-destructive font-medium">{errors.minLevel.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status" className="font-semibold text-sm">
                  Status *
                </Label>
                <select
                  id="status"
                  {...register("status")}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {errors.status && <p className="text-xs text-destructive font-medium">{errors.status.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="font-semibold text-sm">
                Detailed Specifications & Description *
              </Label>
              <textarea
                id="description"
                rows={4}
                placeholder="Include technical specs, pressure ratings, materials, certification references..."
                {...register("description")}
                className={`w-full p-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background ${errors.description ? "border-destructive focus:ring-destructive" : ""}`}
              />
              {errors.description && <p className="text-xs text-destructive font-medium">{errors.description.message}</p>}
            </div>

            <div className="flex items-center gap-3 justify-end pt-4 border-t border-white/5">
              <Link to="/products">
                <Button type="button" variant="ghost" className="rounded-xl">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl shadow-lg shadow-primary/20">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding to Catalog...
                  </>
                ) : (
                  "Create Catalog Item"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
