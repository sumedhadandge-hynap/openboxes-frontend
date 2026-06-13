import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Search, Plus, Shield, Key, ShieldAlert, Loader2, X, Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  getUsers,
  createUser,
  getUserRoles,
  assignUserRole,
  removeUserRole,
  type User,
  type UserRole
} from "./usersApi"
import { getRoles } from "../roles/rolesApi"

export function UsersList() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  
  // Dialog Open States
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isManageRolesOpen, setIsManageRolesOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)

  // Selected User state for role management
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [createdUser, setCreatedUser] = useState<User | null>(null)
  const [copied, setCopied] = useState(false)

  // Form states for Add User
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [selectedRoleUid, setSelectedRoleUid] = useState("")

  // Role Assignment Selection
  const [assignRoleUid, setAssignRoleUid] = useState("")

  // React Query: Get Users
  const { data: users = [], isLoading: isFetchingUsers } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: getUsers,
  })

  // React Query: Get Available Roles (from Roles List)
  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  })

  // React Query: Get User Roles (enabled when Manage Roles Dialog is open)
  const { data: userRoles = [], isLoading: isFetchingUserRoles } = useQuery<UserRole[]>({
    queryKey: ["userRoles", selectedUser?.uid],
    queryFn: () => getUserRoles(selectedUser!.uid),
    enabled: !!selectedUser?.uid,
  })

  // React Query: Create User Mutation
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setCreatedUser(newUser)
      setIsAddOpen(false)
      setIsSuccessOpen(true)
      // Reset form
      setFirstName("")
      setLastName("")
      setEmail("")
      setSelectedRoleUid("")
    },
  })

  // React Query: Assign User Role Mutation
  const assignRoleMutation = useMutation({
    mutationFn: ({ userUid, roleUid }: { userUid: string; roleUid: string }) =>
      assignUserRole(userUid, roleUid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userRoles", selectedUser?.uid] })
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setAssignRoleUid("")
    },
  })

  // React Query: Remove User Role Mutation
  const removeRoleMutation = useMutation({
    mutationFn: ({ userUid, roleUid }: { userUid: string; roleUid: string }) =>
      removeUserRole(userUid, roleUid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userRoles", selectedUser?.uid] })
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName || !lastName || !email || !selectedRoleUid) return

    createUserMutation.mutate({
      firstName,
      lastName,
      email,
      roleUid: selectedRoleUid,
    })
  }

  const handleAssignRole = () => {
    if (!selectedUser || !assignRoleUid) return
    assignRoleMutation.mutate({
      userUid: selectedUser.uid,
      roleUid: assignRoleUid,
    })
  }

  const handleRemoveRole = (roleUid: string) => {
    if (!selectedUser) return
    if (confirm("Are you sure you want to remove this role from the user?")) {
      removeRoleMutation.mutate({
        userUid: selectedUser.uid,
        roleUid,
      })
    }
  }

  const handleCopyPassword = () => {
    if (createdUser?.temporaryPassword) {
      navigator.clipboard.writeText(createdUser.temporaryPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Filter users based on search
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase()
    const emailMatch = (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    const nameMatch = fullName.includes(searchTerm.toLowerCase())
    
    // Check if any role names match
    const roleMatch = u.roles?.some((r) => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return nameMatch || emailMatch || !!roleMatch
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
            User Directory
          </h2>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage user accounts, assign system access roles, and track permission credentials.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary/20 shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      {/* Filters Card */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-background/40 backdrop-blur-sm p-4 rounded-2xl border border-white/5 shadow-sm">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background/50 rounded-xl"
          />
        </div>
      </div>

      {/* Users Loading / Content */}
      {isFetchingUsers ? (
        <div className="py-24 text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Fetching directory list...</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/5 bg-background/30 backdrop-blur-md overflow-hidden shadow">
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="w-full text-left border-collapse hidden md:table">
              <thead>
                <tr className="border-b border-white/10 text-xs text-muted-foreground uppercase tracking-wider bg-background/20">
                  <th className="p-4 font-semibold">User Details</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Assigned Roles</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredUsers.map((user) => {
                  const displayName = `${user.firstName} ${user.lastName}`
                  return (
                    <tr key={user.uid} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-orange-400 text-white font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
                            {user.firstName?.charAt(0) || "U"}
                          </div>
                          <div>
                            <div className="font-bold text-foreground">{displayName}</div>
                            <span className="text-[10px] text-muted-foreground font-mono">UID: {user.uid}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-foreground/80 font-medium">{user.email}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <Badge key={role.uid} variant="outline" className="rounded-md border-white/10 px-2 py-0.5 text-xs bg-primary/5 text-primary font-medium">
                                {role.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs italic text-muted-foreground">No roles assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsManageRolesOpen(true)
                            }}
                            className="rounded-lg h-9 border-white/10 text-xs font-semibold"
                          >
                            <Shield className="h-3.5 w-3.5 mr-1 text-primary" /> Manage Roles
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted-foreground bg-background/10">
                      No users found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mobile / Tablet Grid View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:hidden">
              {filteredUsers.map((user) => {
                const displayName = `${user.firstName} ${user.lastName}`
                return (
                  <div key={user.uid} className="bg-background/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3 transition-colors hover:bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-orange-400 text-white font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
                        {user.firstName?.charAt(0) || "U"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-foreground text-sm truncate">{displayName}</div>
                        <span className="text-[10px] text-muted-foreground font-mono block truncate">UID: {user.uid}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-foreground/80 font-medium truncate" title={user.email}>
                      {user.email}
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 flex-1 content-start">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <Badge key={role.uid} variant="outline" className="rounded-md border-white/10 px-2 py-0.5 text-[10px] bg-primary/5 text-primary font-medium">
                            {role.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs italic text-muted-foreground">No roles assigned</span>
                      )}
                    </div>
                    
                    <div className="mt-2 pt-3 border-t border-white/5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsManageRolesOpen(true)
                        }}
                        className="w-full rounded-lg h-9 border-white/10 text-xs font-semibold"
                      >
                        <Shield className="h-3.5 w-3.5 mr-1 text-primary" /> Manage Roles
                      </Button>
                    </div>
                  </div>
                )
              })}
              
              {filteredUsers.length === 0 && (
                <div className="col-span-full py-8 text-center text-muted-foreground bg-background/10 rounded-xl">
                  No users found matching filters.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add User Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl border-white/10 glass-card">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add New User Account</DialogTitle>
              <DialogDescription>
                Create a staff credentials profile and attach a primary role configuration.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {createUserMutation.isError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{createUserMutation.error instanceof Error ? createUserMutation.error.message : "User creation failed"}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="e.g. Rahul"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="e.g. Maske"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="usrEmail">Email Address *</Label>
                <Input
                  id="usrEmail"
                  type="email"
                  placeholder="e.g. rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="roleSelect">Initial Access Role *</Label>
                <select
                  id="roleSelect"
                  value={selectedRoleUid}
                  onChange={(e) => setSelectedRoleUid(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="" disabled>Select a role...</option>
                  {roles.map((role: any) => (
                    <option key={role.uid || role.id} value={role.uid || role.id}>
                      {role.name} ({role.roleType})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={createUserMutation.isPending} className="rounded-xl">
                {createUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success / Temporary Password Modal */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl border-white/10 glass-card">
          <DialogHeader>
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2">
              <Check className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-center">User Created Successfully</DialogTitle>
            <DialogDescription className="text-center">
              Please share the temporary login password with the staff member.
            </DialogDescription>
          </DialogHeader>

          {createdUser && (
            <div className="space-y-4 py-4">
              <div className="rounded-2xl bg-muted/40 p-4 border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-semibold">User:</span>
                  <span className="font-bold text-foreground">{createdUser.firstName} {createdUser.lastName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-semibold">Email:</span>
                  <span className="font-mono text-foreground">{createdUser.email}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                  <span className="text-muted-foreground font-semibold">Temp Password:</span>
                  <span className="font-mono font-bold text-primary text-sm bg-primary/10 px-2 py-0.5 rounded">
                    {createdUser.temporaryPassword || "Temp@123456"}
                  </span>
                </div>
              </div>

              <Button onClick={handleCopyPassword} variant="outline" className="w-full rounded-xl border-white/10">
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-emerald-500" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" /> Copy Password
                  </>
                )}
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsSuccessOpen(false)} className="w-full rounded-xl">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Roles Dialog */}
      <Dialog open={isManageRolesOpen} onOpenChange={setIsManageRolesOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-white/10 glass-card">
          <DialogHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <DialogTitle className="text-xl font-bold">Manage User Roles</DialogTitle>
              </div>
            </div>
            <DialogDescription>
              Assign or revoke authorization levels for <span className="font-bold text-foreground">{selectedUser?.firstName} {selectedUser?.lastName}</span>.
            </DialogDescription>
          </DialogHeader>

          {isFetchingUserRoles ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Loading assigned roles...</p>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {/* Assigned Roles List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assigned Roles</h4>
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                  {userRoles.map((role) => (
                    <div key={role.uid} className="flex items-center justify-between bg-muted/30 p-2.5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2.5">
                        <Key className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-foreground block">{role.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{role.roleType}</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRole(role.uid)}
                        disabled={removeRoleMutation.isPending}
                        className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {userRoles.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-white/5 rounded-xl bg-background/5">
                      <ShieldAlert className="h-8 w-8 text-muted-foreground mx-auto mb-1.5 opacity-55" />
                      <span className="text-xs text-muted-foreground">No roles currently assigned</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Assign Another Role Form */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assign Another Role</h4>
                <div className="flex gap-2">
                  <select
                    value={assignRoleUid}
                    onChange={(e) => setAssignRoleUid(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select a role to assign...</option>
                    {roles
                      // Filter out roles already assigned to the user
                      .filter((r: any) => !userRoles.some((ur) => ur.uid === (r.uid || r.id)))
                      .map((role: any) => (
                        <option key={role.uid || role.id} value={role.uid || role.id}>
                          {role.name} ({role.roleType})
                        </option>
                      ))}
                  </select>
                  <Button
                    type="button"
                    onClick={handleAssignRole}
                    disabled={!assignRoleUid || assignRoleMutation.isPending}
                    className="rounded-xl px-4"
                  >
                    {assignRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Assign
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsManageRolesOpen(false)} className="w-full rounded-xl">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
