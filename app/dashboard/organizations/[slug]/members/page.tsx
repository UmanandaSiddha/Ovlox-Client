"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Search,
    Users,
    Filter,
    MoreVertical,
    Mail,
    UserMinus,
    Edit,
    Shield,
    Calendar
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

type Member = {
    id: string
    name: string
    email: string
    role: "owner" | "admin" | "member"
    avatar?: string
    joinedAt: string
    lastActive: string
    projectsCount: number
    status: "active" | "inactive" | "invited"
}

const sampleMembers: Member[] = [
    { id: "1", name: "John Doe", email: "john@example.com", role: "owner", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John", joinedAt: "6 months ago", lastActive: "2 hours ago", projectsCount: 12, status: "active" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", role: "admin", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane", joinedAt: "5 months ago", lastActive: "1 day ago", projectsCount: 8, status: "active" },
    { id: "3", name: "Bob Wilson", email: "bob@example.com", role: "member", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob", joinedAt: "3 months ago", lastActive: "5 hours ago", projectsCount: 4, status: "active" },
    { id: "4", name: "Alice Johnson", email: "alice@example.com", role: "member", joinedAt: "2 months ago", lastActive: "3 days ago", projectsCount: 6, status: "inactive" },
    { id: "5", name: "Charlie Brown", email: "charlie@example.com", role: "admin", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie", joinedAt: "4 months ago", lastActive: "1 hour ago", projectsCount: 10, status: "active" },
    { id: "6", name: "Diana Prince", email: "diana@example.com", role: "member", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana", joinedAt: "1 month ago", lastActive: "2 weeks ago", projectsCount: 2, status: "inactive" },
]

export default function Members() {
    const [members, setMembers] = React.useState<Member[]>(sampleMembers)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [roleFilter, setRoleFilter] = React.useState<string>("all")
    const [statusFilter, setStatusFilter] = React.useState<string>("all")

    const filtered = React.useMemo(() => {
        return members.filter((member) => {
            const matchesSearch = searchQuery === "" ||
                member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.email.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesRole = roleFilter === "all" || member.role === roleFilter
            const matchesStatus = statusFilter === "all" || member.status === statusFilter

            return matchesSearch && matchesRole && matchesStatus
        })
    }, [members, searchQuery, roleFilter, statusFilter])

    const activeCount = members.filter(m => m.status === "active").length
    const totalMembers = members.length

    const getStatusColor = (status: Member["status"]) => {
        switch (status) {
            case "active":
                return "bg-green-500"
            case "inactive":
                return "bg-gray-400"
            case "invited":
                return "bg-yellow-500"
        }
    }

    const getRoleBadgeVariant = (role: Member["role"]) => {
        switch (role) {
            case "owner":
                return "destructive"
            case "admin":
                return "secondary"
            case "member":
                return "outline"
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-2">Members</h1>
                <p className="text-muted-foreground">Manage your team members and their roles</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Members</p>
                            <p className="text-2xl font-bold mt-1">{totalMembers}</p>
                        </div>
                        <Users className="size-8 text-muted-foreground" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Active</p>
                            <p className="text-2xl font-bold mt-1">{activeCount}</p>
                        </div>
                        <div className="size-3 rounded-full bg-green-500" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Admins</p>
                            <p className="text-2xl font-bold mt-1">{members.filter(m => m.role === "admin").length}</p>
                        </div>
                        <Shield className="size-8 text-muted-foreground" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Members</p>
                            <p className="text-2xl font-bold mt-1">{members.filter(m => m.role === "member").length}</p>
                        </div>
                        <Users className="size-8 text-muted-foreground" />
                    </div>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                    <Input
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="invited">Invited</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <Users className="size-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No members found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    filtered.map((member) => (
                        <Card key={member.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={member.avatar} />
                                            <AvatarFallback>
                                                {member.name.split(" ").map((n) => n[0]).join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-card ${getStatusColor(member.status)}`} />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{member.name}</p>
                                        <p className="text-sm text-muted-foreground">{member.email}</p>
                                    </div>
                                </div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreVertical className="size-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48 p-0" align="end">
                                        <Sidebar>
                                            <SidebarContent>
                                                <SidebarGroup>
                                                    <SidebarGroupContent>
                                                        <SidebarMenu>
                                                            <SidebarMenuItem>
                                                                <SidebarMenuButton>
                                                                    <Edit className="size-4" />
                                                                    <span>Edit Member</span>
                                                                </SidebarMenuButton>
                                                            </SidebarMenuItem>
                                                            <SidebarMenuItem>
                                                                <SidebarMenuButton>
                                                                    <Shield className="size-4" />
                                                                    <span>Change Role</span>
                                                                </SidebarMenuButton>
                                                            </SidebarMenuItem>
                                                            <SidebarMenuItem>
                                                                <SidebarMenuButton>
                                                                    <Mail className="size-4" />
                                                                    <span>Send Message</span>
                                                                </SidebarMenuButton>
                                                            </SidebarMenuItem>
                                                            <SidebarMenuItem>
                                                                <SidebarMenuButton className="text-destructive">
                                                                    <UserMinus className="size-4" />
                                                                    <span>Remove</span>
                                                                </SidebarMenuButton>
                                                            </SidebarMenuItem>
                                                        </SidebarMenu>
                                                    </SidebarGroupContent>
                                                </SidebarGroup>
                                            </SidebarContent>
                                        </Sidebar>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Role</span>
                                    <Badge variant={getRoleBadgeVariant(member.role)} className="capitalize">
                                        {member.role}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Projects</span>
                                    <span className="text-sm font-medium">{member.projectsCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Joined</span>
                                    <span className="text-sm font-medium">{member.joinedAt}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Last Active</span>
                                    <span className="text-sm font-medium">{member.lastActive}</span>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
