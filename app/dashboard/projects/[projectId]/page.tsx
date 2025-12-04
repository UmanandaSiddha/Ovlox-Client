"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
    Settings,
    Plus,
    MoreVertical,
    Calendar,
    Users,
    FileText,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    GitBranch,
    MessageSquare,
    Share2,
    Search,
    Filter,
    Grid3x3,
    List,
    BarChart3
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

type Task = {
    id: string
    title: string
    status: "todo" | "in-progress" | "review" | "done"
    priority: "low" | "medium" | "high"
    assignee?: { name: string; avatar?: string }
    dueDate?: string
    progress?: number
}

const sampleTasks: Task[] = [
    {
        id: "1",
        title: "Design database schema",
        status: "done",
        priority: "high",
        assignee: { name: "John Doe", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" },
        dueDate: "2024-12-01",
        progress: 100
    },
    {
        id: "2",
        title: "API authentication implementation",
        status: "in-progress",
        priority: "high",
        assignee: { name: "Jane Smith", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane" },
        dueDate: "2024-12-08",
        progress: 75
    },
    {
        id: "3",
        title: "Frontend UI components",
        status: "in-progress",
        priority: "high",
        assignee: { name: "Bob Wilson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob" },
        dueDate: "2024-12-15",
        progress: 50
    },
    {
        id: "4",
        title: "Setup CI/CD pipeline",
        status: "todo",
        priority: "medium",
        dueDate: "2024-12-20",
        progress: 0
    },
    {
        id: "5",
        title: "Performance optimization",
        status: "review",
        priority: "medium",
        assignee: { name: "Alice Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice" },
        dueDate: "2024-12-22",
        progress: 90
    },
]

export default function Project() {
    const [tasks, setTasks] = React.useState<Task[]>(sampleTasks)
    const [viewMode, setViewMode] = React.useState<"board" | "list">("board")
    const [filterStatus, setFilterStatus] = React.useState<string>("all")
    const [searchQuery, setSearchQuery] = React.useState("")

    const filteredTasks = React.useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch = searchQuery === "" || task.title.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesStatus = filterStatus === "all" || task.status === filterStatus
            return matchesSearch && matchesStatus
        })
    }, [tasks, searchQuery, filterStatus])

    const getStatusColor = (status: Task["status"]) => {
        switch (status) {
            case "todo":
                return "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
            case "in-progress":
                return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
            case "review":
                return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
            case "done":
                return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
        }
    }

    const getPriorityColor = (priority: Task["priority"]) => {
        switch (priority) {
            case "low":
                return "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
            case "medium":
                return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
            case "high":
                return "text-red-600 bg-red-50 dark:bg-red-900/20"
        }
    }

    const getTasksByStatus = (status: Task["status"]) => {
        return filteredTasks.filter(task => task.status === status)
    }

    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === "done").length,
        inProgress: tasks.filter(t => t.status === "in-progress").length,
        overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length,
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Mobile App Redesign</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Badge variant="outline">MAR</Badge>
                        <span>Updated 2 hours ago</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Share2 className="size-4" />
                        Share
                    </Button>
                    <Button variant="outline" size="sm">
                        <Settings className="size-4" />
                        Settings
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Tasks</p>
                            <p className="text-2xl font-bold mt-1">{stats.total}</p>
                        </div>
                        <FileText className="size-8 text-muted-foreground" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">In Progress</p>
                            <p className="text-2xl font-bold mt-1">{stats.inProgress}</p>
                        </div>
                        <Clock className="size-8 text-blue-600" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Completed</p>
                            <p className="text-2xl font-bold mt-1">{stats.completed}</p>
                        </div>
                        <CheckCircle2 className="size-8 text-green-600" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Progress</p>
                            <p className="text-2xl font-bold mt-1">{Math.round((stats.completed / stats.total) * 100)}%</p>
                        </div>
                        <TrendingUp className="size-8 text-purple-600" />
                    </div>
                </Card>
            </div>

            {/* Project Description */}
            <Card className="p-6 mb-6">
                <h2 className="font-semibold mb-2">About this project</h2>
                <p className="text-muted-foreground mb-4">
                    A comprehensive redesign of the mobile application focusing on improving user experience, modernizing the UI, and optimizing performance. This project involves coordination across design, frontend, and backend teams.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                        <p className="font-semibold flex items-center gap-2">
                            <Calendar className="size-4" />
                            Dec 1, 2024
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">End Date</p>
                        <p className="font-semibold flex items-center gap-2">
                            <Calendar className="size-4" />
                            Dec 31, 2024
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Team Size</p>
                        <p className="font-semibold flex items-center gap-2">
                            <Users className="size-4" />
                            5 members
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <Badge className="mt-1">In Progress</Badge>
                    </div>
                </div>
            </Card>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center justify-between">
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                        <Input
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 sm:w-64"
                        />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[140px]">
                            <Filter className="size-4 mr-2" />
                            <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tasks</SelectItem>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="review">In Review</SelectItem>
                            <SelectItem value="done">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant={viewMode === "board" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("board")}
                    >
                        <Grid3x3 className="size-4" />
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                    >
                        <List className="size-4" />
                    </Button>
                    <Button size="sm">
                        <Plus className="size-4" />
                        Add Task
                    </Button>
                </div>
            </div>

            {/* Board View */}
            {viewMode === "board" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {["todo", "in-progress", "review", "done"].map((status) => (
                        <Card key={status} className="p-4 bg-muted/30">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold capitalize flex items-center gap-2">
                                    <span className={`size-2 rounded-full ${status === "todo" ? "bg-gray-500" :
                                            status === "in-progress" ? "bg-blue-500" :
                                                status === "review" ? "bg-yellow-500" :
                                                    "bg-green-500"
                                        }`} />
                                    {status.replace("-", " ")}
                                </h3>
                                <Badge variant="outline">{getTasksByStatus(status as Task["status"]).length}</Badge>
                            </div>
                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {getTasksByStatus(status as Task["status"]).map((task) => (
                                    <Card key={task.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow bg-background">
                                        <div className="space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-medium text-sm">{task.title}</p>
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
                                                                                    <span>Edit</span>
                                                                                </SidebarMenuButton>
                                                                            </SidebarMenuItem>
                                                                            <SidebarMenuItem>
                                                                                <SidebarMenuButton>
                                                                                    <span>Duplicate</span>
                                                                                </SidebarMenuButton>
                                                                            </SidebarMenuItem>
                                                                            <SidebarMenuItem>
                                                                                <SidebarMenuButton className="text-destructive">
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
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className={`text-xs capitalize ${getPriorityColor(task.priority)}`}>
                                                    {task.priority}
                                                </Badge>
                                                {task.progress !== undefined && (
                                                    <Badge variant="outline" className="text-xs">{task.progress}%</Badge>
                                                )}
                                            </div>
                                            {task.progress !== undefined && (
                                                <div className="w-full bg-muted rounded-full h-1.5">
                                                    <div
                                                        className="bg-primary h-full rounded-full transition-all"
                                                        style={{ width: `${task.progress}%` }}
                                                    />
                                                </div>
                                            )}
                                            {task.assignee && (
                                                <Avatar className="size-6">
                                                    <AvatarImage src={task.assignee.avatar} />
                                                    <AvatarFallback className="text-xs">
                                                        {task.assignee.name.split(" ").map(n => n[0]).join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                            {task.dueDate && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Calendar className="size-3" />
                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
                <Card>
                    <div className="overflow-x-auto">
                        <div className="p-4 space-y-2">
                            {filteredTasks.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="size-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 mb-4 text-sm font-medium text-muted-foreground border-b pb-2">
                                    <div>Task</div>
                                    <div>Status</div>
                                    <div>Priority</div>
                                    <div>Assignee</div>
                                    <div>Due Date</div>
                                    <div></div>
                                </div>
                            )}
                            {filteredTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-sm">{task.title}</p>
                                        {task.progress !== undefined && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-16 bg-muted rounded-full h-1.5">
                                                    <div
                                                        className="bg-primary h-full rounded-full"
                                                        style={{ width: `${task.progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground">{task.progress}%</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Badge className={`text-xs capitalize ${getStatusColor(task.status)}`}>
                                            {task.status.replace("-", " ")}
                                        </Badge>
                                    </div>
                                    <div>
                                        <Badge variant="outline" className={`text-xs capitalize ${getPriorityColor(task.priority)}`}>
                                            {task.priority}
                                        </Badge>
                                    </div>
                                    <div>
                                        {task.assignee ? (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="size-6">
                                                    <AvatarImage src={task.assignee.avatar} />
                                                    <AvatarFallback className="text-xs">
                                                        {task.assignee.name.split(" ").map(n => n[0]).join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm">{task.assignee.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Unassigned</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                                    </div>
                                    <div>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreVertical className="size-4" />
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
                                                                            <span>Edit</span>
                                                                        </SidebarMenuButton>
                                                                    </SidebarMenuItem>
                                                                    <SidebarMenuItem>
                                                                        <SidebarMenuButton>
                                                                            <span>Duplicate</span>
                                                                        </SidebarMenuButton>
                                                                    </SidebarMenuItem>
                                                                    <SidebarMenuItem>
                                                                        <SidebarMenuButton className="text-destructive">
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}