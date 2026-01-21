"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    FileText,
    Search,
    Plus,
    Filter,
    CheckCircle2,
    Clock,
    Circle,
    AlertCircle,
    MoreVertical,
    Calendar,
    User,
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useParams, useRouter } from "next/navigation"
import { useOrg } from "@/hooks/useOrg"
import { useProject } from "@/hooks/useProject"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function Tasks() {
    const params = useParams()
    const router = useRouter()
    const { projectId } = params
    const { currentOrg } = useOrg()
    const { loadProject, currentProject } = useProject()

    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState<string>("all")
    const [isLoading, setIsLoading] = React.useState(false)

    React.useEffect(() => {
        if (currentOrg?.id && projectId) {
            loadProject(currentOrg.id, projectId as string)
        }
    }, [currentOrg?.id, projectId])

    // Mock tasks data - replace with actual API call
    type Task = {
        id: string
        title?: string
        description?: string
        status: string
        priority?: string
        [key: string]: any
    }

    const tasks = React.useMemo<Task[]>(() => {
        return []
    }, [])

    const filteredTasks = React.useMemo(() => {
        let filtered = tasks

        if (searchQuery) {
            filtered = filtered.filter(task =>
                task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter(task => task.status === statusFilter)
        }

        return filtered
    }, [tasks, searchQuery, statusFilter])

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "done":
                return <CheckCircle2 className="size-4 text-green-600" />
            case "in-progress":
                return <Clock className="size-4 text-blue-600" />
            case "todo":
                return <Circle className="size-4 text-gray-400" />
            default:
                return <AlertCircle className="size-4 text-gray-400" />
        }
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "done":
                return "default"
            case "in-progress":
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
                    <h1 className="text-2xl font-semibold mb-2">Tasks</h1>
                    <p className="text-muted-foreground">Manage and track project tasks</p>
                </div>
                <Button>
                    <Plus className="size-4 mr-2" />
                    New Task
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                    <Input
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="todo">Todo</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Tasks */}
            <Card className="p-6">
                {isLoading ? (
                    <div className="text-center py-12">Loading tasks...</div>
                ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="size-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchQuery || statusFilter !== "all"
                                ? "Try adjusting your search or filters"
                                : "Get started by creating your first task"}
                        </p>
                        {!searchQuery && statusFilter === "all" && (
                            <Button>
                                <Plus className="size-4 mr-2" />
                                Create Task
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredTasks.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(task.status)}
                                        <span className="font-medium">{task.title}</span>
                                    </div>
                                    <Badge variant={getStatusBadgeVariant(task.status)} className="capitalize">
                                        {task.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3">
                                    {task.assignee && (
                                        <Avatar className="size-6">
                                            <AvatarImage src={task.assignee.avatar} />
                                            <AvatarFallback>
                                                {task.assignee.name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    {task.dueDate && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Calendar className="size-3" />
                                            {new Date(task.dueDate).toLocaleDateString()}
                                        </div>
                                    )}
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    )
}
