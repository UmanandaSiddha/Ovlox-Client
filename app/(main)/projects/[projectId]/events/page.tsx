"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Activity,
    Search,
    Filter,
    GitCommit,
    GitPullRequest,
    GitBranch,
    MessageSquare,
    Calendar,
    Clock,
    TrendingUp,
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useParams } from "next/navigation"
import { useOrg } from "@/hooks/useOrg"
import { useProject } from "@/hooks/useProject"
import { appIconMap } from "@/lib/app.icons"
import { ExternalProvider } from "@/types/enum"

export default function Events() {
    const params = useParams()
    const { projectId } = params
    const { currentOrg } = useOrg()
    const { loadProject, currentProject } = useProject()

    const [searchQuery, setSearchQuery] = React.useState("")
    const [typeFilter, setTypeFilter] = React.useState<string>("all")
    const [isLoading, setIsLoading] = React.useState(false)

    React.useEffect(() => {
        if (currentOrg?.id && projectId) {
            loadProject(currentOrg.id, projectId as string)
        }
    }, [currentOrg?.id, projectId])

    // Mock events data - replace with actual API call
    type Event = {
        id: string
        title?: string
        description?: string
        type: string
        timestamp: Date
        [key: string]: any
    }

    const events = React.useMemo<Event[]>(() => {
        return []
    }, [])

    const filteredEvents = React.useMemo(() => {
        let filtered = events

        if (searchQuery) {
            filtered = filtered.filter(event =>
                event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        if (typeFilter !== "all") {
            filtered = filtered.filter(event => event.type === typeFilter)
        }

        return filtered
    }, [events, searchQuery, typeFilter])

    const getEventIcon = (type: string) => {
        switch (type) {
            case "commit":
                return <GitCommit className="size-4" />
            case "pull_request":
                return <GitPullRequest className="size-4" />
            case "message":
                return <MessageSquare className="size-4" />
            default:
                return <Activity className="size-4" />
        }
    }

    const formatTime = (date: string | Date) => {
        const d = new Date(date)
        const now = new Date()
        const diff = now.getTime() - d.getTime()
        const hours = Math.floor(diff / 3600000)
        const minutes = Math.floor((diff % 3600000) / 60000)

        if (hours > 24) {
            return d.toLocaleDateString()
        } else if (hours > 0) {
            return `${hours}h ago`
        } else if (minutes > 0) {
            return `${minutes}m ago`
        }
        return "just now"
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-2">Events</h1>
                <p className="text-muted-foreground">View project activity and events timeline</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Events</p>
                            <p className="text-2xl font-bold mt-1">{events.length}</p>
                        </div>
                        <Activity className="size-8 text-muted-foreground" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Today</p>
                            <p className="text-2xl font-bold mt-1">0</p>
                        </div>
                        <Clock className="size-8 text-blue-600" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">This Week</p>
                            <p className="text-2xl font-bold mt-1">0</p>
                        </div>
                        <Calendar className="size-8 text-green-600" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Activity</p>
                            <p className="text-2xl font-bold mt-1">0%</p>
                        </div>
                        <TrendingUp className="size-8 text-purple-600" />
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                    <Input
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="commit">Commits</SelectItem>
                        <SelectItem value="pull_request">Pull Requests</SelectItem>
                        <SelectItem value="message">Messages</SelectItem>
                        <SelectItem value="issue">Issues</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Events Timeline */}
            <Card className="p-6">
                {isLoading ? (
                    <div className="text-center py-12">Loading events...</div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-12">
                        <Activity className="size-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No events found</h3>
                        <p className="text-muted-foreground">
                            {searchQuery || typeFilter !== "all"
                                ? "Try adjusting your search or filters"
                                : "Project events will appear here as integrations sync data"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredEvents.map((event) => (
                            <div
                                key={event.id}
                                className="flex gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="mt-1">
                                        {getEventIcon(event.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium">{event.title}</h3>
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {event.type}
                                            </Badge>
                                        </div>
                                        {event.description && (
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {event.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            {event.author && (
                                                <div className="flex items-center gap-1">
                                                    <Avatar className="size-4">
                                                        <AvatarImage src={event.author.avatar} />
                                                        <AvatarFallback>
                                                            {event.author.name?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span>{event.author.name}</span>
                                                </div>
                                            )}
                                            <span>{formatTime(event.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    )
}
