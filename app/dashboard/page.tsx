"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Plus, Users, Building2, MoreHorizontal, Search, Settings2, FileText, Copy, Link, CornerUpRight, Trash2, LogOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

type Organization = {
    id: string
    name: string
    logo?: string
    role: "owner" | "admin" | "member"
    memberCount: number
    projectCount: number
}

const sampleOrganizations: Organization[] = [
    { id: "1", name: "Acme Inc", role: "owner", memberCount: 12, projectCount: 8 },
    { id: "2", name: "Tech Corp", role: "admin", memberCount: 5, projectCount: 3 },
    { id: "3", name: "Dev Studio", role: "member", memberCount: 20, projectCount: 15 },
]

const menuItems = [
    [
        { label: "Settings", icon: Settings2 },
        { label: "View Details", icon: FileText },
    ],
    [
        { label: "Copy Link", icon: Link },
        { label: "Duplicate", icon: Copy },
    ],
    [
        { label: "Leave Organization", icon: LogOut },
        { label: "Delete", icon: Trash2 },
    ],
]

export default function Dashboard() {
    // Toggle between sample orgs and empty state
    const [organizations] = React.useState<Organization[]>(sampleOrganizations)
    const [searchQuery, setSearchQuery] = React.useState("")
    // const [organizations] = React.useState<Organization[]>([]) // Uncomment to test empty state

    const filtered = React.useMemo(() => {
        if (!searchQuery) return organizations
        return organizations.filter((org) =>
            org.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [organizations, searchQuery])

    const getRoleBadgeVariant = (role: Organization["role"]) => {
        switch (role) {
            case "owner":
                return "default"
            case "admin":
                return "secondary"
            case "member":
                return "outline"
            default:
                return "outline"
        }
    }

    if (organizations.length === 0) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="rounded-full bg-muted p-6 mb-4">
                        <Building2 className="size-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">No organizations yet</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        Get started by creating your first organization or join an existing one to collaborate with your team.
                    </p>
                    <div className="flex items-center gap-3">
                        <Button size="lg">
                            <Plus className="size-4" />
                            Create Organization
                        </Button>
                        <Button variant="outline" size="lg">
                            <Users className="size-4" />
                            Join Organization
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Organizations</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage and access your organizations
                    </p>
                </div>
                <Button>
                    <Plus className="size-4" />
                    New Organization
                </Button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                    <Input
                        placeholder="Search organizations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((org) => (
                    <article
                        key={org.id}
                        className="group relative border border-border rounded-lg p-6 bg-card shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer overflow-hidden"
                    >
                        {/* Subtle gradient background on hover */}
                        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                        <div className="relative">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <Avatar className="h-14 w-14 rounded-lg ring-2 ring-border group-hover:ring-primary/30 transition-all duration-200">
                                        <AvatarImage src={org.logo} alt={org.name} />
                                        <AvatarFallback className="rounded-lg text-lg font-semibold bg-linear-to-br from-primary/20 to-primary/10">
                                            {org.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                                            {org.name}
                                        </h3>
                                        <Badge variant={getRoleBadgeVariant(org.role)} className="mt-1.5 capitalize text-xs">
                                            {org.role}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Three-dot menu */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 -mt-1 -mr-2"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreHorizontal className="size-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-56 overflow-hidden rounded-lg p-0"
                                        align="end"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Sidebar collapsible="none" className="bg-transparent">
                                            <SidebarContent>
                                                {menuItems.map((group, index) => (
                                                    <SidebarGroup key={index} className="border-b last:border-none">
                                                        <SidebarGroupContent className="gap-0">
                                                            <SidebarMenu>
                                                                {group.map((item, idx) => (
                                                                    <SidebarMenuItem key={idx}>
                                                                        <SidebarMenuButton>
                                                                            <item.icon className="size-4" />
                                                                            <span>{item.label}</span>
                                                                        </SidebarMenuButton>
                                                                    </SidebarMenuItem>
                                                                ))}
                                                            </SidebarMenu>
                                                        </SidebarGroupContent>
                                                    </SidebarGroup>
                                                ))}
                                            </SidebarContent>
                                        </Sidebar>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                                {/* Stacked avatars for members */}
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {[...Array(Math.min(org.memberCount, 3))].map((_, i) => (
                                            <Avatar key={i} className="size-6 border-2 border-card">
                                                <AvatarFallback className="text-xs">
                                                    {String.fromCharCode(65 + i)}
                                                </AvatarFallback>
                                            </Avatar>
                                        ))}
                                        {org.memberCount > 3 && (
                                            <div className="size-6 rounded-full border-2 border-card bg-muted flex items-center justify-center">
                                                <span className="text-xs font-medium">+{org.memberCount - 3}</span>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground">members</span>
                                </div>

                                {/* Projects count with icon */}
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Building2 className="size-4" />
                                    <span className="font-medium">{org.projectCount}</span>
                                    <span className="text-xs">projects</span>
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    )
}