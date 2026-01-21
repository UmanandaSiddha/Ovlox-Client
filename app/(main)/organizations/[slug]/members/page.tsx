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
    Shield,
    Mail,
    UserMinus,
    Edit,
    Plus,
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useParams, useRouter } from "next/navigation"
import { listMembers, inviteMember, updateMember, removeMember } from "@/services/org.service"
import { IOrganizationMember } from "@/types/prisma-generated"
import { PredefinedOrgRole, OrgMemberStatus } from "@/types/enum"
import { toast } from "sonner"
import { useOrg } from "@/hooks/useOrg"

export default function Members() {
    const params = useParams()
    const router = useRouter()
    const { slug } = params
    const { loadOrgBySlug, currentOrg } = useOrg()

    const [members, setMembers] = React.useState<IOrganizationMember[]>([])
    const [searchQuery, setSearchQuery] = React.useState("")
    const [roleFilter, setRoleFilter] = React.useState<string>("all")
    const [statusFilter, setStatusFilter] = React.useState<string>("all")
    const [isLoading, setIsLoading] = React.useState(true)
    const [showInviteDialog, setShowInviteDialog] = React.useState(false)
    const [inviteEmail, setInviteEmail] = React.useState("")
    const [inviteRole, setInviteRole] = React.useState<PredefinedOrgRole>(PredefinedOrgRole.DEVELOPER)
    const [isInviting, setIsInviting] = React.useState(false)

    React.useEffect(() => {
        if (slug) {
            loadOrgBySlug(slug as string)
        }
    }, [slug, loadOrgBySlug])

    React.useEffect(() => {
        if (currentOrg?.id) {
            fetchMembers()
        }
    }, [currentOrg?.id])

    const fetchMembers = async () => {
        if (!currentOrg?.id) return
        setIsLoading(true)
        try {
            const response = await listMembers(currentOrg.id)
            setMembers(response.data || [])
        } catch (error) {
            console.error("Failed to load members", error)
            toast.error("Failed to load members")
        } finally {
            setIsLoading(false)
        }
    }

    const handleInvite = async () => {
        if (!currentOrg?.id || !inviteEmail) return
        setIsInviting(true)
        try {
            await inviteMember(currentOrg.id, {
                email: inviteEmail,
                predefinedRole: inviteRole,
            })
            toast.success("Invitation sent successfully")
            setShowInviteDialog(false)
            setInviteEmail("")
            fetchMembers()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to send invitation")
        } finally {
            setIsInviting(false)
        }
    }

    const handleUpdateRole = async (memberId: string, role: PredefinedOrgRole) => {
        if (!currentOrg?.id) return
        try {
            await updateMember(currentOrg.id, memberId, { predefinedRole: role })
            toast.success("Role updated successfully")
            fetchMembers()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to update role")
        }
    }

    const handleRemoveMember = async (memberId: string) => {
        if (!currentOrg?.id) return
        if (!confirm("Are you sure you want to remove this member?")) return
        try {
            await removeMember(currentOrg.id, memberId)
            toast.success("Member removed successfully")
            fetchMembers()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to remove member")
        }
    }

    const filtered = React.useMemo(() => {
        return members.filter((member) => {
            const matchesSearch = searchQuery === "" ||
                `${member.user?.firstName} ${member.user?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesRole = roleFilter === "all" || member.predefinedRole === roleFilter
            const matchesStatus = statusFilter === "all" || member.status === statusFilter

            return matchesSearch && matchesRole && matchesStatus
        })
    }, [members, searchQuery, roleFilter, statusFilter])

    const activeCount = members.filter(m => m.status === OrgMemberStatus.ACTIVE).length
    const totalMembers = members.length

    const getStatusColor = (status: OrgMemberStatus) => {
        switch (status) {
            case OrgMemberStatus.ACTIVE:
                return "bg-green-500"
            case OrgMemberStatus.INVITED:
                return "bg-yellow-500"
            case OrgMemberStatus.SUSPENDED:
                return "bg-red-500"
        }
    }

    const getRoleBadgeVariant = (role?: PredefinedOrgRole | null) => {
        switch (role) {
            case PredefinedOrgRole.OWNER:
                return "default"
            case PredefinedOrgRole.ADMIN:
                return "secondary"
            default:
                return "outline"
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold mb-2">Members</h1>
                    <p className="text-muted-foreground">Manage your team members and their roles</p>
                </div>
                <Button onClick={() => setShowInviteDialog(true)}>
                    <Plus className="size-4 mr-2" />
                    Invite Member
                </Button>
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
                            <p className="text-2xl font-bold mt-1">{members.filter(m => m.predefinedRole === PredefinedOrgRole.ADMIN || m.predefinedRole === PredefinedOrgRole.OWNER).length}</p>
                        </div>
                        <Shield className="size-8 text-muted-foreground" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Invited</p>
                            <p className="text-2xl font-bold mt-1">{members.filter(m => m.status === OrgMemberStatus.INVITED).length}</p>
                        </div>
                        <Mail className="size-8 text-muted-foreground" />
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
                        <SelectItem value={PredefinedOrgRole.OWNER}>Owner</SelectItem>
                        <SelectItem value={PredefinedOrgRole.ADMIN}>Admin</SelectItem>
                        <SelectItem value={PredefinedOrgRole.DEVELOPER}>Developer</SelectItem>
                        <SelectItem value={PredefinedOrgRole.VIEWER}>Viewer</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value={OrgMemberStatus.ACTIVE}>Active</SelectItem>
                        <SelectItem value={OrgMemberStatus.INVITED}>Invited</SelectItem>
                        <SelectItem value={OrgMemberStatus.SUSPENDED}>Suspended</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Members List */}
            <Card className="p-6">
                {isLoading ? (
                    <div className="text-center py-12">Loading members...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="size-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No members found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="relative">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={member.user?.avatarUrl || undefined} />
                                            <AvatarFallback>
                                                {`${member.user?.firstName?.[0]}${member.user?.lastName?.[0]}`}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-card ${getStatusColor(member.status)}`} />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{`${member.user?.firstName} ${member.user?.lastName}`}</p>
                                        <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant={getRoleBadgeVariant(member.predefinedRole)} className="capitalize">
                                        {member.predefinedRole || "Member"}
                                    </Badge>
                                    {member.predefinedRole !== PredefinedOrgRole.OWNER && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <Edit className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleUpdateRole(member.id, PredefinedOrgRole.ADMIN)}>
                                                    Make Admin
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleUpdateRole(member.id, PredefinedOrgRole.DEVELOPER)}>
                                                    Make Developer
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleUpdateRole(member.id, PredefinedOrgRole.VIEWER)}>
                                                    Make Viewer
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRemoveMember(member.id)} className="text-destructive">
                                                    <UserMinus className="size-4 mr-2" />
                                                    Remove
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Invite Dialog */}
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Member</DialogTitle>
                        <DialogDescription>
                            Send an invitation to join this organization
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Email</label>
                            <Input
                                type="email"
                                placeholder="user@example.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Role</label>
                            <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as PredefinedOrgRole)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={PredefinedOrgRole.DEVELOPER}>Developer</SelectItem>
                                    <SelectItem value={PredefinedOrgRole.ADMIN}>Admin</SelectItem>
                                    <SelectItem value={PredefinedOrgRole.VIEWER}>Viewer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleInvite} disabled={isInviting || !inviteEmail}>
                            {isInviting ? "Sending..." : "Send Invitation"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
