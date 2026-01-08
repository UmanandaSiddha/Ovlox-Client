"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Shield,
    Plus,
    Edit,
    Trash2,
    Users,
    Lock,
    Unlock,
    Copy,
    Settings,
    Eye,
    MoreVertical
} from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"

type Permission = {
    id: string
    name: string
    description: string
    category: "projects" | "members" | "organization" | "integrations"
}

type Role = {
    id: string
    name: string
    description: string
    memberCount: number
    permissions: string[]
    isDefault: boolean
    isCustom: boolean
}

const permissions: Permission[] = [
    // Projects
    { id: "projects.view", name: "View Projects", description: "View all projects in the organization", category: "projects" },
    { id: "projects.create", name: "Create Projects", description: "Create new projects", category: "projects" },
    { id: "projects.edit", name: "Edit Projects", description: "Edit project details and settings", category: "projects" },
    { id: "projects.delete", name: "Delete Projects", description: "Delete projects permanently", category: "projects" },
    { id: "projects.archive", name: "Archive Projects", description: "Archive and restore projects", category: "projects" },

    // Members
    { id: "members.view", name: "View Members", description: "View all team members", category: "members" },
    { id: "members.invite", name: "Invite Members", description: "Send invitations to new members", category: "members" },
    { id: "members.edit", name: "Edit Members", description: "Edit member details and roles", category: "members" },
    { id: "members.remove", name: "Remove Members", description: "Remove members from organization", category: "members" },

    // Organization
    { id: "org.view", name: "View Settings", description: "View organization settings", category: "organization" },
    { id: "org.edit", name: "Edit Settings", description: "Edit organization settings", category: "organization" },
    { id: "org.billing", name: "Manage Billing", description: "Manage billing and subscriptions", category: "organization" },
    { id: "org.delete", name: "Delete Organization", description: "Delete organization permanently", category: "organization" },

    // Integrations
    { id: "integrations.view", name: "View Integrations", description: "View connected integrations", category: "integrations" },
    { id: "integrations.manage", name: "Manage Integrations", description: "Connect and disconnect integrations", category: "integrations" },
]

const sampleRoles: Role[] = [
    {
        id: "1",
        name: "Owner",
        description: "Full access to everything in the organization",
        memberCount: 1,
        permissions: permissions.map(p => p.id),
        isDefault: true,
        isCustom: false,
    },
    {
        id: "2",
        name: "Admin",
        description: "Manage projects, members, and most organization settings",
        memberCount: 3,
        permissions: [
            "projects.view", "projects.create", "projects.edit", "projects.archive",
            "members.view", "members.invite", "members.edit",
            "org.view", "org.edit",
            "integrations.view", "integrations.manage"
        ],
        isDefault: true,
        isCustom: false,
    },
    {
        id: "3",
        name: "Member",
        description: "Basic access to view and contribute to projects",
        memberCount: 8,
        permissions: [
            "projects.view", "projects.create",
            "members.view",
            "org.view",
            "integrations.view"
        ],
        isDefault: true,
        isCustom: false,
    },
    {
        id: "4",
        name: "Project Manager",
        description: "Custom role for managing projects and inviting members",
        memberCount: 2,
        permissions: [
            "projects.view", "projects.create", "projects.edit", "projects.archive",
            "members.view", "members.invite",
            "org.view",
            "integrations.view"
        ],
        isDefault: false,
        isCustom: true,
    },
]

export default function Roles() {
    const [roles, setRoles] = React.useState<Role[]>(sampleRoles)
    const [selectedRole, setSelectedRole] = React.useState<Role | null>(null)
    const [editMode, setEditMode] = React.useState(false)

    const groupedPermissions = React.useMemo(() => {
        return permissions.reduce((acc, permission) => {
            if (!acc[permission.category]) {
                acc[permission.category] = []
            }
            acc[permission.category].push(permission)
            return acc
        }, {} as Record<string, Permission[]>)
    }, [])

    const hasPermission = (roleId: string, permissionId: string) => {
        const role = roles.find(r => r.id === roleId)
        return role?.permissions.includes(permissionId) || false
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold mb-2">Roles & Permissions</h1>
                    <p className="text-muted-foreground">Manage roles and their permissions</p>
                </div>
                <Button>
                    <Plus className="size-4" />
                    Create Role
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Roles</p>
                            <p className="text-2xl font-bold mt-1">{roles.length}</p>
                        </div>
                        <Shield className="size-8 text-muted-foreground" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Default Roles</p>
                            <p className="text-2xl font-bold mt-1">{roles.filter(r => r.isDefault).length}</p>
                        </div>
                        <Lock className="size-8 text-muted-foreground" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Custom Roles</p>
                            <p className="text-2xl font-bold mt-1">{roles.filter(r => r.isCustom).length}</p>
                        </div>
                        <Unlock className="size-8 text-muted-foreground" />
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Roles List */}
                <div className="lg:col-span-1">
                    <Card className="p-4">
                        <h2 className="font-semibold mb-4">Roles</h2>
                        <div className="space-y-2">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => setSelectedRole(role)}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedRole?.id === role.id
                                            ? "bg-primary/10 border-primary"
                                            : "border-border hover:bg-muted"
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Shield className="size-4" />
                                            <p className="font-medium">{role.name}</p>
                                        </div>
                                        {!role.isDefault && (
                                            <Popover>
                                                <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                        <MoreVertical className="size-3" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-40 p-0" align="end">
                                                    <Sidebar>
                                                        <SidebarContent>
                                                            <SidebarGroup>
                                                                <SidebarGroupContent>
                                                                    <SidebarMenu>
                                                                        <SidebarMenuItem>
                                                                            <SidebarMenuButton>
                                                                                <Edit className="size-4" />
                                                                                <span>Edit</span>
                                                                            </SidebarMenuButton>
                                                                        </SidebarMenuItem>
                                                                        <SidebarMenuItem>
                                                                            <SidebarMenuButton>
                                                                                <Copy className="size-4" />
                                                                                <span>Duplicate</span>
                                                                            </SidebarMenuButton>
                                                                        </SidebarMenuItem>
                                                                        <SidebarMenuItem>
                                                                            <SidebarMenuButton className="text-destructive">
                                                                                <Trash2 className="size-4" />
                                                                                <span>Delete</span>
                                                                            </SidebarMenuButton>
                                                                        </SidebarMenuItem>
                                                                    </SidebarMenu>
                                                                </SidebarGroupContent>
                                                            </SidebarGroup>
                                                        </SidebarContent>
                                                    </Sidebar>
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">{role.description}</p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            <Users className="size-3 mr-1" />
                                            {role.memberCount} members
                                        </Badge>
                                        {role.isDefault && (
                                            <Badge variant="secondary" className="text-xs">
                                                Default
                                            </Badge>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Permissions Panel */}
                <div className="lg:col-span-2">
                    {selectedRole ? (
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold mb-1">{selectedRole.name}</h2>
                                    <p className="text-sm text-muted-foreground">{selectedRole.description}</p>
                                </div>
                                {!selectedRole.isDefault && (
                                    <Button variant="outline" size="sm">
                                        <Edit className="size-4" />
                                        Edit Role
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {Object.entries(groupedPermissions).map(([category, perms]) => (
                                    <div key={category} className="space-y-3">
                                        <h3 className="font-semibold capitalize flex items-center gap-2">
                                            {category === "projects" && <Settings className="size-4" />}
                                            {category === "members" && <Users className="size-4" />}
                                            {category === "organization" && <Shield className="size-4" />}
                                            {category === "integrations" && <Lock className="size-4" />}
                                            {category}
                                        </h3>
                                        <div className="space-y-2 pl-6">
                                            {perms.map((permission) => {
                                                const enabled = hasPermission(selectedRole.id, permission.id)
                                                return (
                                                    <div
                                                        key={permission.id}
                                                        className="flex items-center justify-between p-3 rounded-lg border border-border"
                                                    >
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm">{permission.name}</p>
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                {permission.description}
                                                            </p>
                                                        </div>
                                                        <Switch
                                                            checked={enabled}
                                                            disabled={selectedRole.isDefault}
                                                        />
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {selectedRole.isDefault && (
                                <div className="mt-6 p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Lock className="size-4" />
                                        This is a default role. Permissions cannot be modified. Create a custom role to customize permissions.
                                    </p>
                                </div>
                            )}
                        </Card>
                    ) : (
                        <Card className="p-12">
                            <div className="text-center">
                                <Shield className="size-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Select a role</h3>
                                <p className="text-muted-foreground">
                                    Choose a role from the list to view and manage its permissions
                                </p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
