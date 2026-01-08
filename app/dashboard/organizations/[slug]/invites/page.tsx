"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
    CheckCircle2
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type Invite = {
    id: string
    email: string
    role: "owner" | "admin" | "member"
    invitedBy: string
    invitedAt: string
    status: "pending" | "accepted" | "expired"
}

const sampleInvites: Invite[] = [
    { id: "1", email: "sarah@example.com", role: "admin", invitedBy: "John Doe", invitedAt: "2 days ago", status: "pending" },
    { id: "2", email: "mike@example.com", role: "member", invitedBy: "Jane Smith", invitedAt: "5 days ago", status: "pending" },
    { id: "3", email: "emma@example.com", role: "member", invitedBy: "John Doe", invitedAt: "1 week ago", status: "accepted" },
    { id: "4", email: "david@example.com", role: "admin", invitedBy: "Jane Smith", invitedAt: "2 weeks ago", status: "expired" },
]

export default function Invites() {
    const [invites, setInvites] = React.useState<Invite[]>(sampleInvites)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [newEmail, setNewEmail] = React.useState("")
    const [newRole, setNewRole] = React.useState<"admin" | "member">("member")

    const filtered = React.useMemo(() => {
        if (!searchQuery) return invites
        return invites.filter((invite) =>
            invite.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invite.invitedBy.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [invites, searchQuery])

    const pendingCount = invites.filter(i => i.status === "pending").length
    const acceptedCount = invites.filter(i => i.status === "accepted").length

    const getStatusColor = (status: Invite["status"]) => {
        switch (status) {
            case "pending":
                return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
            case "accepted":
                return "text-green-600 bg-green-50 dark:bg-green-900/20"
            case "expired":
                return "text-red-600 bg-red-50 dark:bg-red-900/20"
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-2">Invitations</h1>
                <p className="text-muted-foreground">Manage pending and sent invitations to your organization</p>
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

            {/* New Invite Form */}
            <Card className="p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Send New Invitation</h2>
                <div className="flex gap-3">
                    <div className="flex-1">
                        <Input
                            placeholder="Email address"
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                        />
                    </div>
                    <Select value={newRole} onValueChange={(value: "admin" | "member") => setNewRole(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button>
                        <Send className="size-4" />
                        Send Invite
                    </Button>
                </div>
            </Card>

            {/* Search and Filter */}
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
                <div className="space-y-4">
                    {filtered.length === 0 ? (
                        <div className="text-center py-12">
                            <UserPlus className="size-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No invitations found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery ? "Try adjusting your search" : "Send your first invitation to get started"}
                            </p>
                        </div>
                    ) : (
                        filtered.map((invite) => (
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
                                            <Badge variant={invite.role === "admin" ? "secondary" : "outline"} className="capitalize text-xs">
                                                {invite.role}
                                            </Badge>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(invite.status)}`}>
                                                {invite.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Invited by {invite.invitedBy} • {invite.invitedAt}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {invite.status === "pending" && (
                                        <Button variant="ghost" size="sm">
                                            <RefreshCw className="size-4" />
                                            Resend
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm">
                                        <X className="size-4" />
                                        Revoke
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    )
}
