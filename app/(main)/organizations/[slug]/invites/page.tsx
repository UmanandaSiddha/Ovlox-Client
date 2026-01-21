"use client"

import * as React from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Mail,
    Clock,
    X,
    Send,
    UserPlus,
    Search,
    RefreshCw,
    CheckCircle2,
    Plus
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
import { useParams } from "next/navigation"
import { listInvites, inviteMember } from "@/services/org.service"
import { IInvite } from "@/types/prisma-generated"
import { PredefinedOrgRole, InviteStatus } from "@/types/enum"
import { toast } from "sonner"
import { useOrg } from "@/hooks/useOrg"

export default function Invites() {
    const params = useParams()
    const { slug } = params
    const { loadOrgBySlug, currentOrg } = useOrg()

    const [invites, setInvites] = React.useState<IInvite[]>([])
    const [searchQuery, setSearchQuery] = React.useState("")
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
            fetchInvites()
        }
    }, [currentOrg?.id])

    const fetchInvites = async () => {
        if (!currentOrg?.id) return
        setIsLoading(true)
        try {
            const response = await listInvites(currentOrg.id)
            setInvites(response.data || [])
        } catch (error) {
            console.error("Failed to load invites", error)
            toast.error("Failed to load invitations")
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
            fetchInvites()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to send invitation")
        } finally {
            setIsInviting(false)
        }
    }

    const handleResend = async (inviteId: string) => {
        // Resend logic would go here
        toast.info("Resend functionality coming soon")
    }

    const handleCancel = async (inviteId: string) => {
        // Cancel invite logic would go here
        toast.info("Cancel invite functionality coming soon")
    }

    const filtered = React.useMemo(() => {
        if (!searchQuery) return invites
        return invites.filter((invite) =>
            invite.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [invites, searchQuery])

    const pendingCount = invites.filter(i => i.status === InviteStatus.PENDING).length
    const acceptedCount = invites.filter(i => i.status === InviteStatus.ACCEPTED).length

    const getStatusColor = (status: InviteStatus) => {
        switch (status) {
            case InviteStatus.PENDING:
                return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
            case InviteStatus.ACCEPTED:
                return "text-green-600 bg-green-50 dark:bg-green-900/20"
            default:
                return "text-red-600 bg-red-50 dark:bg-red-900/20"
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold mb-2">Invitations</h1>
                    <p className="text-muted-foreground">Manage pending and sent invitations to your organization</p>
                </div>
                <Button onClick={() => setShowInviteDialog(true)}>
                    <Plus className="size-4 mr-2" />
                    Send Invitation
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Invites</p>
                            <p className="text-2xl font-bold mt-1">{invites.length}</p>
                        </div>
                        <Mail className="size-8 text-muted-foreground" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Pending</p>
                            <p className="text-2xl font-bold mt-1">{pendingCount}</p>
                        </div>
                        <Clock className="size-8 text-yellow-600" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Accepted</p>
                            <p className="text-2xl font-bold mt-1">{acceptedCount}</p>
                        </div>
                        <CheckCircle2 className="size-8 text-green-600" />
                    </div>
                </Card>
            </div>

            {/* Search */}
            <div className="mb-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                    <Input
                        placeholder="Search invites..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Invites List */}
            <Card className="p-6">
                {isLoading ? (
                    <div className="text-center py-12">Loading invitations...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12">
                        <UserPlus className="size-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No invitations found</h3>
                        <p className="text-muted-foreground">
                            {searchQuery ? "Try adjusting your search" : "Send your first invitation to get started"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((invite) => (
                            <div key={invite.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4 flex-1">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback>
                                            {invite.email.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{invite.email}</p>
                                            <Badge variant={invite.predefinedRole === PredefinedOrgRole.ADMIN ? "secondary" : "outline"} className="capitalize text-xs">
                                                {invite.predefinedRole || "Member"}
                                            </Badge>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(invite.status)}`}>
                                                {invite.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Invited {new Date(invite.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {invite.status === InviteStatus.PENDING && (
                                        <Button variant="ghost" size="sm" onClick={() => handleResend(invite.id)}>
                                            <RefreshCw className="size-4 mr-2" />
                                            Resend
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => handleCancel(invite.id)}>
                                        <X className="size-4 mr-2" />
                                        Cancel
                                    </Button>
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
                        <DialogTitle>Send New Invitation</DialogTitle>
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
                            <Send className="size-4 mr-2" />
                            {isInviting ? "Sending..." : "Send Invitation"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
