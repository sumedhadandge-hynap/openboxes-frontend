import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Shield, Key, Info, Loader2, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { getRoles } from "../roles/rolesApi"
import {
  getPermissions,
  getRolePermissions,
  assignRolePermission,
  removeRolePermission,
  type SystemPermission
} from "./permissionsApi"

export function PermissionsList() {
  const queryClient = useQueryClient()
  const [errorMsg, setErrorMsg] = useState("")

  // React Query: Get All Roles
  const { data: roles = [], isLoading: isFetchingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  })

  // React Query: Get All System Permissions
  const { data: allPermissions = [], isLoading: isFetchingPermissions } = useQuery<SystemPermission[]>({
    queryKey: ["permissions"],
    queryFn: getPermissions,
  })

  // React Query: Fetch mapping of assigned permissions per role
  const { data: rolePermissionsMap = {}, isLoading: isFetchingMapping } = useQuery<Record<string, string[]>>({
    queryKey: ["rolePermissionsMap", roles],
    queryFn: async () => {
      const map: Record<string, string[]> = {}
      await Promise.all(
        roles.map(async (role) => {
          const roleUid = role.uid || role.id
          try {
            const perms = await getRolePermissions(roleUid)
            map[roleUid] = perms.map((p) => p.uid)
          } catch (e) {
            console.error(`Error loading permissions for role ${roleUid}`, e)
            map[roleUid] = []
          }
        })
      )
      return map
    },
    enabled: roles.length > 0,
  })

  // React Query: Assign Permission Mutation
  const assignMutation = useMutation({
    mutationFn: ({ roleUid, permissionUid }: { roleUid: string; permissionUid: string }) =>
      assignRolePermission(roleUid, permissionUid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rolePermissionsMap"] })
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to assign permission")
      setTimeout(() => setErrorMsg(""), 4000)
    }
  })

  // React Query: Remove Permission Mutation
  const removeMutation = useMutation({
    mutationFn: ({ roleUid, permissionUid }: { roleUid: string; permissionUid: string }) =>
      removeRolePermission(roleUid, permissionUid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rolePermissionsMap"] })
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to remove permission")
      setTimeout(() => setErrorMsg(""), 4000)
    }
  })

  const handleToggle = (roleUid: string, permissionUid: string, isAssigned: boolean) => {
    if (isAssigned) {
      removeMutation.mutate({ roleUid, permissionUid })
    } else {
      assignMutation.mutate({ roleUid, permissionUid })
    }
  }

  const isLoading = isFetchingRoles || isFetchingPermissions || isFetchingMapping

  // Check if a cell is currently mutating
  const isCellMutating = (roleUid: string, permissionUid: string) => {
    const isAssigning =
      assignMutation.isPending &&
      assignMutation.variables?.roleUid === roleUid &&
      assignMutation.variables?.permissionUid === permissionUid

    const isRemoving =
      removeMutation.isPending &&
      removeMutation.variables?.roleUid === roleUid &&
      removeMutation.variables?.permissionUid === permissionUid

    return isAssigning || isRemoving
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
            Permissions Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure Role-Based Access Control (RBAC). Grant or revoke system permissions for active roles.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-24 text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Loading RBAC permissions matrix...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-4">
          {/* Helper Card */}
          <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl md:col-span-1 flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> Active Roles
              </CardTitle>
              <CardDescription>
                System roles dynamically fetched from the database configuration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs flex-1">
              {roles.map((role: any) => (
                <div key={role.id || role.uid} className="space-y-1 bg-muted/20 p-2.5 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{role.name}</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono">
                      {role.roleType}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-snug mt-1">
                    {role.description || "No description provided."}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Matrix Card */}
          <Card className="border border-white/5 bg-background/30 backdrop-blur-md rounded-2xl md:col-span-3 overflow-hidden shadow">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" /> Role-Permission Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-background/40 border-b border-white/10">
                      <th className="p-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider w-1/3">
                        Permission Spec
                      </th>
                      {roles.map((role: any) => (
                        <th key={role.id || role.uid} className="p-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider text-center">
                          {role.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allPermissions.map((perm) => (
                      <tr key={perm.uid} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-foreground">{perm.name}</div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-normal">{perm.description}</p>
                        </td>
                        {roles.map((role: any) => {
                          const roleUid = role.uid || role.id
                          const assignedList = rolePermissionsMap[roleUid] || []
                          const isAssigned = assignedList.includes(perm.uid)
                          const mutating = isCellMutating(roleUid, perm.uid)

                          return (
                            <td key={roleUid} className="p-4 text-center">
                              <div className="flex justify-center items-center">
                                {mutating ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                ) : (
                                  <input
                                    type="checkbox"
                                    checked={isAssigned}
                                    onChange={() => handleToggle(roleUid, perm.uid, isAssigned)}
                                    className="h-4 w-4 rounded border-white/20 bg-background/50 accent-primary cursor-pointer transition-all hover:scale-110"
                                  />
                                )}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}

                    {allPermissions.length === 0 && (
                      <tr>
                        <td colSpan={roles.length + 1} className="py-12 text-center text-muted-foreground bg-background/10">
                          No system permissions registered in the database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-muted/20 border-t border-white/5 flex gap-2 items-center text-xs text-muted-foreground">
                <Info className="h-4 w-4 text-primary shrink-0" />
                <span>Permission assignments are committed immediately to the backend and applied dynamically to active sessions.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
