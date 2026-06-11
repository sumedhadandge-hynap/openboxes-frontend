import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Search, Plus, ShieldCheck, Edit2, Trash2, Users, ShieldAlert, Loader2, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import type { Role } from "@/types/roles"
import { RoleType } from "@/types/roles"
import { getRoles, createRole, updateRole, deleteRole } from "./rolesApi"

// Helper to format enum key to human-readable title-case label
export const formatRoleTypeLabel = (type: string): string => {
  return type
    .replace(/^ROLE_/, "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

// Zod Validation Schema
const roleSchema = z.object({
  name: z.string()
    .min(3, "Role Name must be at least 3 characters")
    .max(50, "Role Name must be at most 50 characters")
    .regex(/^[a-zA-Z0-9\s-]+$/, "Name can only contain letters, numbers, spaces, and hyphens"),
  roleType: z.nativeEnum(RoleType, {
    message: "Please select a valid role type key"
  }),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(200, "Description must be at most 200 characters"),
})

type RoleFormValues = z.infer<typeof roleSchema>

export function RolesList() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  
  // Dialog Open States
  const [isAddEditOpen, setIsAddEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isSelectOpen, setIsSelectOpen] = useState(false)

  // Sub-states managed alongside the form
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  // React Query: Get Roles
  const { data: roles = [], isLoading: isFetching } = useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: getRoles,
  })

  // React Query: Create Role mutation
  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      setIsAddEditOpen(false)
    },
  })

  // React Query: Update Role mutation
  const updateMutation = useMutation({
    mutationFn: updateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      setIsAddEditOpen(false)
    },
  })

  // React Query: Delete Role mutation
  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      setIsDeleteOpen(false)
      setRoleToDelete(null)
    },
  })

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      roleType: undefined,
      description: "",
    }
  })

  // Watch selected RoleType for custom dropdown UI
  const selectedRoleType = watch("roleType")

  // Synchronize form on edit toggle
  const handleOpenAdd = () => {
    setEditingRole(null)
    reset({
      name: "",
      roleType: undefined,
      description: "",
    })
    setIsSelectOpen(false)
    setIsAddEditOpen(true)
  }

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role)
    reset({
      name: role.name,
      roleType: role.roleType,
      description: role.description,
    })
    setIsSelectOpen(false)
    setIsAddEditOpen(true)
  }

  const handleOpenDelete = (role: Role) => {
    setRoleToDelete(role)
    setIsDeleteOpen(true)
  }

  const onSubmit = (values: RoleFormValues) => {
    if (editingRole) {
      updateMutation.mutate({
        ...editingRole,
        name: values.name,
        roleType: values.roleType,
        description: values.description,
      })
    } else {
      createMutation.mutate({
        name: values.name,
        roleType: values.roleType,
        description: values.description,
      })
    }
  }

  const handleDeleteConfirm = () => {
    if (roleToDelete) {
      deleteMutation.mutate(roleToDelete.id)
    }
  }

  // Filters
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.roleType.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">System Roles</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Define system authorization groups and assign role types keys to manage access.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
          <Plus className="mr-2 h-4 w-4" /> Create Role
        </Button>
      </div>

      {/* Control Bar */}
      <div className="flex items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 h-11 rounded-xl bg-card border-border/60 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Fetching State */}
      {isFetching ? (
        <div className="py-24 text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Loading roles configuration...</p>
        </div>
      ) : (
        /* Roles Grid Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRoles.length > 0 ? (
            filteredRoles.map((role) => (
              <div
                key={role.id}
                className="group flex flex-col justify-between rounded-3xl border border-white/20 dark:border-white/10 bg-card/60 backdrop-blur-xl p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden"
              >
                {/* Card top border light */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold tracking-tight text-foreground">{role.name}</h3>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 font-medium">
                          <Users className="h-3.5 w-3.5" />
                          {role.usersCount} active {role.usersCount === 1 ? "user" : "users"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(role)}
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDelete(role)}
                        disabled={role.roleType === RoleType.ROLE_ADMIN}
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground/90 leading-relaxed mt-2 mb-4">
                    {role.description}
                  </p>
                </div>

                {/* Metadata Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                    Role Key
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px] py-0.5 rounded-lg border-border bg-muted/40 text-foreground/80">
                    {role.roleType}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center rounded-3xl border border-dashed border-border/60 bg-muted/20">
              <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground">No roles found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search filter or create a new role.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Role Dialog */}
      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent className="max-w-2xl sm:rounded-3xl border border-white/20 dark:border-white/10 bg-card/95 backdrop-blur-md shadow-2xl p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {editingRole ? "Edit Role" : "Create New Role"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Set up access credentials and assign system role type keys.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <input type="hidden" {...register("roleType")} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Role Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-semibold text-sm">Role Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Warehouse Manager"
                    {...register("name")}
                    className={`rounded-xl h-11 border-border/60 focus-visible:ring-primary focus-visible:border-primary ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive font-medium animate-in slide-in-from-top-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Custom Themed Dropdown Select */}
                <div className="space-y-2 relative">
                  <Label htmlFor="roleType" className="font-semibold text-sm">Role Type Key</Label>
                  
                  <button
                    type="button"
                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                    className={`mt-2 flex h-11 w-full items-center justify-between rounded-xl border bg-background px-3 py-2 text-sm text-left transition-all ${
                      errors.roleType 
                        ? "border-destructive focus:ring-destructive" 
                        : "border-border/60 hover:border-primary/60 focus:ring-primary"
                    }`}
                  >
                    <span className={selectedRoleType ? "text-foreground font-semibold" : "text-muted-foreground"}>
                      {selectedRoleType ? `${formatRoleTypeLabel(selectedRoleType)} (${selectedRoleType})` : "Select a Role Type Key..."}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>

                  {/* Dropdown Popover */}
                  {isSelectOpen && (
                    <>
                      {/* Overlay backdrop to catch click outside */}
                      <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsSelectOpen(false)} />
                      
                      <div className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-2xl scrollbar-hide animate-in fade-in slide-in-from-top-1 duration-150">
                        {Object.values(RoleType).map((type) => {
                          const isSelected = selectedRoleType === type
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setValue("roleType", type, { shouldValidate: true })
                                setIsSelectOpen(false)
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all text-left ${
                                isSelected
                                  ? "bg-primary text-primary-foreground font-semibold"
                                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                              }`}
                            >
                              <span className="font-semibold">{formatRoleTypeLabel(type)}</span>
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground/80 border border-border/40"
                              }`}>
                                {type}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}

                  {errors.roleType && (
                    <p className="text-xs text-destructive font-medium animate-in slide-in-from-top-1">{errors.roleType.message}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="font-semibold text-sm">Description</Label>
                <textarea
                  id="description"
                  rows={3}
                  placeholder="Describe what members of this role are authorized to do..."
                  {...register("description")}
                  className={`flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-primary focus-visible:border-primary border-border/60 ${errors.description ? "border-destructive" : ""}`}
                />
                {errors.description && (
                  <p className="text-xs text-destructive font-medium animate-in slide-in-from-top-1">{errors.description.message}</p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddEditOpen(false)}
                className="rounded-xl border-border/60"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-gradient-to-r from-primary to-orange-600 text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingRole ? "Save Changes" : "Create Role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md sm:rounded-3xl border border-white/20 dark:border-white/10 bg-card/95 backdrop-blur-md shadow-2xl p-6">
          <DialogHeader>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-3">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">Delete Role</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Are you sure you want to delete the <strong className="text-foreground">"{roleToDelete?.name}"</strong> role? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => setIsDeleteOpen(false)}
              className="rounded-xl border-border/60"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={handleDeleteConfirm}
              className="rounded-xl shadow-md shadow-destructive/10 hover:shadow-lg hover:shadow-destructive/20"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
