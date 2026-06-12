import { useState } from "react"
import { useWarehouseStore } from "@/store/useWarehouseStore"
import { Plus, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// Zod schema
const allocationSchema = z.object({
  projectId: z.string().min(1, "Please select a target project"),
  warehouseId: z.string().min(1, "Please select a source warehouse"),
  productId: z.string().min(1, "Please select an inventory item"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
})

const projectSchema = z.object({
  code: z.string().min(3, "Project code must be at least 3 characters").toUpperCase(),
  name: z.string().min(5, "Project name must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  manager: z.string().min(3, "Manager name must be at least 3 characters"),
  status: z.enum(["Planning", "Active", "Completed", "On Hold"]),
})

export function ProjectsPage() {
  const { projects, products, warehouses, addProject, allocateProjectStock, selectedWarehouseId } = useWarehouseStore()
  const [selectedProjectId, setSelectedProjectId] = useState<string>("All")
  
  // Modals state
  const [isAllocOpen, setIsAllocOpen] = useState(false)
  const [isProjOpen, setIsProjOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const getProductDetails = (prodId: string) => {
    return products.find((p) => p.id === prodId) || { name: "Unknown Product", sku: "N/A", unitOfMeasure: "Units" }
  }

  // React Hook Forms
  const {
    register: registerAlloc,
    handleSubmit: handleSubmitAlloc,
    reset: resetAlloc,
    formState: { errors: errorsAlloc },
  } = useForm({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      projectId: "",
      warehouseId: selectedWarehouseId || "",
      productId: "",
      quantity: 1,
    }
  })

  const {
    register: registerProj,
    handleSubmit: handleSubmitProj,
    reset: resetProj,
    formState: { errors: errorsProj },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      manager: "",
      status: "Active" as const,
    },
  })

  const openAllocModal = () => {
    setErrorMsg("")
    setSuccessMsg("")
    resetAlloc({
      projectId: "",
      warehouseId: selectedWarehouseId || "",
      productId: "",
      quantity: 1,
    })
    setIsAllocOpen(true)
  }

  const openProjModal = () => {
    resetProj()
    setIsProjOpen(true)
  }

  const onAllocSubmit = (data: z.infer<typeof allocationSchema>) => {
    setErrorMsg("")
    setSuccessMsg("")
    
    const success = allocateProjectStock(data.projectId, data.warehouseId, data.productId, data.quantity)
    
    if (success) {
      setSuccessMsg("Materials successfully allocated to project crate.")
      setTimeout(() => {
        setIsAllocOpen(false)
      }, 1000)
    } else {
      setErrorMsg("Allocation failed: Insufficient physical stock in selected warehouse depot.")
    }
  }

  const onProjSubmit = (data: z.infer<typeof projectSchema>) => {
    addProject(data)
    setIsProjOpen(false)
  }

  // Filter projects
  const filteredProjects = projects.filter((proj) => {
    if (selectedProjectId === "All") return true
    return proj.id === selectedProjectId
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
            Project Inventory Allocations
          </h2>
          <p className="text-muted-foreground mt-0.5">
            Track materials quarantined or staged for active contracting sites and engineering projects.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openAllocModal} variant="outline" className="rounded-xl border-white/10 shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Allocate Material
          </Button>
          <Button onClick={openProjModal} className="rounded-xl shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Create Project
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-background/40 backdrop-blur-sm p-4 rounded-2xl border border-white/5 shadow-sm">
        <div className="flex items-center gap-2 w-full overflow-x-auto py-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2 shrink-0">
            Contract:
          </span>
          <button
            onClick={() => setSelectedProjectId("All")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              selectedProjectId === "All"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
            }`}
          >
            All Projects
          </button>
          {projects.map((proj) => (
            <button
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedProjectId === proj.id
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              {proj.code} - {proj.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List cards with allocated item details */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredProjects.map((proj) => (
          <Card key={proj.id} className="relative overflow-hidden border border-white/5 bg-background/30 backdrop-blur-md hover:bg-background/40 transition-all rounded-2xl p-6 flex flex-col justify-between">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {proj.code}
                  </span>
                  <h3 className="font-bold text-lg mt-2 leading-snug">
                    {proj.name}
                  </h3>
                </div>
                <Badge
                  className="rounded-full text-[10px] font-bold"
                  variant={
                    proj.status === "Active"
                      ? "default"
                      : proj.status === "Planning"
                      ? "secondary"
                      : proj.status === "Completed"
                      ? "outline"
                      : "destructive"
                  }
                >
                  {proj.status}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {proj.description}
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-4 w-4 text-primary" />
                <span>Site Project Engineer: <strong className="text-foreground/90">{proj.manager}</strong></span>
              </div>

              {/* Allocated items list */}
              <div className="space-y-2 border-t border-white/5 pt-4">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Allocated Staged Cargo</span>
                <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1 scrollbar-hide">
                  {proj.allocatedItems.map((item, idx) => {
                    const prod = getProductDetails(item.productId)
                    return (
                      <div key={idx} className="flex justify-between items-center bg-muted/30 p-2.5 rounded-xl border border-white/5 text-xs">
                        <span className="font-semibold text-foreground/95">{prod.name} ({prod.sku})</span>
                        <span className="font-mono font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                          {item.quantityAllocated} {prod.unitOfMeasure}s
                        </span>
                      </div>
                    )
                  })}
                  {proj.allocatedItems.length === 0 && (
                    <div className="text-center py-4 text-xs text-muted-foreground italic bg-muted/10 rounded-xl">
                      No materials allocated yet. Allocate stock above.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Allocate Stock Modal */}
      <Dialog open={isAllocOpen} onOpenChange={setIsAllocOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl border-white/10 glass-card">
          <form onSubmit={handleSubmitAlloc(onAllocSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Allocate Project Materials</DialogTitle>
              <DialogDescription>
                Staging materials quarantines the stock, staging it exclusively for construction sites.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="allocProj">Target Project *</Label>
                <select
                  id="allocProj"
                  {...registerAlloc("projectId")}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background"
                >
                  <option value="">-- Select Project --</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>{proj.name}</option>
                  ))}
                </select>
                {errorsAlloc.projectId && <p className="text-xs text-destructive font-medium">{errorsAlloc.projectId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="allocWh">Source Warehouse *</Label>
                <select
                  id="allocWh"
                  {...registerAlloc("warehouseId")}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background"
                >
                  {warehouses
                    .filter((wh) => wh.id === selectedWarehouseId)
                    .map((wh) => (
                      <option key={wh.id} value={wh.id}>{wh.name}</option>
                    ))}
                </select>
                {errorsAlloc.warehouseId && <p className="text-xs text-destructive font-medium">{errorsAlloc.warehouseId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="allocProd">Product Hardware *</Label>
                <select
                  id="allocProd"
                  {...registerAlloc("productId")}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background"
                >
                  <option value="">-- Select Product --</option>
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>{prod.name} ({prod.sku})</option>
                  ))}
                </select>
                {errorsAlloc.productId && <p className="text-xs text-destructive font-medium">{errorsAlloc.productId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="allocQty">Quantity to Quarantine *</Label>
                <Input
                  id="allocQty"
                  type="number"
                  placeholder="e.g. 50"
                  {...registerAlloc("quantity", { valueAsNumber: true })}
                  className="rounded-xl bg-background/50 focus:bg-background font-bold"
                />
                {errorsAlloc.quantity && <p className="text-xs text-destructive font-medium">{errorsAlloc.quantity.message}</p>}
              </div>
            </div>

            {errorMsg && <p className="text-xs text-rose-500 font-bold animate-pulse">{errorMsg}</p>}
            {successMsg && <p className="text-xs text-emerald-500 font-bold animate-pulse">{successMsg}</p>}

            <DialogFooter className="border-t border-white/5 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsAllocOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl font-bold">
                Lock Staged Stock
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Project Modal */}
      <Dialog open={isProjOpen} onOpenChange={setIsProjOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl border-white/10 glass-card">
          <form onSubmit={handleSubmitProj(onProjSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create Engineering Project</DialogTitle>
              <DialogDescription>
                Establish a new project site code.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="projCode">Project Code *</Label>
                  <Input
                    id="projCode"
                    placeholder="e.g. METRO-L3"
                    {...registerProj("code")}
                    className="rounded-xl bg-background/50 focus:bg-background font-mono uppercase"
                  />
                  {errorsProj.code && <p className="text-xs text-destructive font-medium">{errorsProj.code.message}</p>}
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="projStatus">Project Status *</Label>
                  <select
                    id="projStatus"
                    {...registerProj("status")}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="projName">Contract Name *</Label>
                <Input
                  id="projName"
                  placeholder="e.g. Mumbai Metro Line 3 Fire Hydrant"
                  {...registerProj("name")}
                  className="rounded-xl bg-background/50 focus:bg-background"
                />
                {errorsProj.name && <p className="text-xs text-destructive font-medium">{errorsProj.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="projManager">Lead Project Engineer *</Label>
                <Input
                  id="projManager"
                  placeholder="e.g. Amit Sharma"
                  {...registerProj("manager")}
                  className="rounded-xl bg-background/50 focus:bg-background"
                />
                {errorsProj.manager && <p className="text-xs text-destructive font-medium">{errorsProj.manager.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="projDesc">Scope of Project Description *</Label>
                <textarea
                  id="projDesc"
                  rows={3}
                  placeholder="Scope of work, installation requirements..."
                  {...registerProj("description")}
                  className="w-full p-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background"
                />
                {errorsProj.description && <p className="text-xs text-destructive font-medium">{errorsProj.description.message}</p>}
              </div>
            </div>

            <DialogFooter className="border-t border-white/5 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsProjOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl font-bold">
                Initialize Site Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
