"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
    Settings,
    Users,
    Building2,
    ArrowRight,
    CheckCircle2,
    XCircle,
    TrendingUp,
    Activity,
    Calendar,
    Plus
} from "lucide-react"
import { SiGithub, SiSlack, SiDiscord, SiFigma, SiJira } from "react-icons/si"
import Link from "next/link"

type Member = {
    id: string
    name: string
    email: string
    role: "owner" | "admin" | "member"
    avatar?: string
}

type ConnectedApp = {
    id: string
    name: string
    icon: React.ComponentType<{ className?: string }>
    connected: boolean
}

type ProjectMetric = {
    name: string
    deploymentsThisWeek: number
    status: "active" | "paused"
    lastDeployment: string
}

const sampleMembers: Member[] = [
    { id: "1", name: "John Doe", email: "john@acme.com", role: "owner" },
    { id: "2", name: "Jane Smith", email: "jane@acme.com", role: "admin" },
    { id: "3", name: "Bob Johnson", email: "bob@acme.com", role: "member" },
    { id: "4", name: "Alice Williams", email: "alice@acme.com", role: "member" },
]

const connectedApps: ConnectedApp[] = [
    { id: "github", name: "GitHub", icon: SiGithub, connected: true },
    { id: "slack", name: "Slack", icon: SiSlack, connected: true },
    { id: "discord", name: "Discord", icon: SiDiscord, connected: false },
    { id: "figma", name: "Figma", icon: SiFigma, connected: false },
    { id: "jira", name: "Jira", icon: SiJira, connected: true },
]

const projectMetrics: ProjectMetric[] = [
    { name: "Main App", deploymentsThisWeek: 12, status: "active", lastDeployment: "2 hours ago" },
    { name: "API Service", deploymentsThisWeek: 8, status: "active", lastDeployment: "5 hours ago" },
    { name: "Dashboard", deploymentsThisWeek: 5, status: "active", lastDeployment: "1 day ago" },
]

export default function Organization() {
    const orgName = "Acme Inc"
    const orgDescription = "Building the future of software development"

    const totalDeployments = projectMetrics.reduce((sum, p) => sum + p.deploymentsThisWeek, 0)
    const activeProjects = projectMetrics.filter(p => p.status === "active").length

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                        <Avatar className="h-20 w-20 rounded-lg">
                            <AvatarImage src="" alt={orgName} />
                            <AvatarFallback className="rounded-lg text-2xl font-bold bg-linear-to-br from-primary/20 to-primary/10">
                                {orgName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-bold">{orgName}</h1>
                            <p className="text-muted-foreground mt-1">{orgDescription}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="default">Owner</Badge>
                                <span className="text-sm text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">{sampleMembers.length} members</span>
                                <span className="text-sm text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">{projectMetrics.length} projects</span>
                            </div>
                        </div>
                    </div>
                    <Button>
                        <Settings className="size-4" />
                        Settings
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Total Projects</span>
                        <Building2 className="size-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold">{projectMetrics.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">{activeProjects} active</p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Team Members</span>
                        <Users className="size-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold">{sampleMembers.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Across all projects</p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Deployments</span>
                        <TrendingUp className="size-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold">{totalDeployments}</div>
                    <p className="text-xs text-green-600 mt-1">This week</p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Integrations</span>
                        <Activity className="size-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold">{connectedApps.filter(a => a.connected).length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Connected apps</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Project Metrics */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Project Activity</h2>
                            <Button variant="outline" size="sm">View All</Button>
                        </div>
                        <div className="space-y-4">
                            {projectMetrics.map((project) => (
                                <div key={project.name} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">{project.name}</h3>
                                            <Badge variant={project.status === "active" ? "default" : "secondary"} className="text-xs">
                                                {project.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Last deployed {project.lastDeployment}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">{project.deploymentsThisWeek}</div>
                                        <p className="text-xs text-muted-foreground">deployments</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Team Members */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Team Members</h2>
                            <Button variant="outline" size="sm">
                                <Plus className="size-4" />
                                Invite
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {sampleMembers.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={member.avatar} alt={member.name} />
                                            <AvatarFallback>
                                                {member.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{member.name}</p>
                                            <p className="text-sm text-muted-foreground">{member.email}</p>
                                        </div>
                                    </div>
                                    <Badge variant={member.role === "owner" ? "default" : member.role === "admin" ? "secondary" : "outline"} className="capitalize">
                                        {member.role}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right Column - 1/3 width */}
                <div className="space-y-6">
                    {/* Connected Apps */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Integrations</h2>
                            <Link href="/dashboard/integration">
                                <Button variant="ghost" size="sm">
                                    Manage
                                    <ArrowRight className="size-3 ml-1" />
                                </Button>
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {connectedApps.map((app) => (
                                <div key={app.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 flex items-center justify-center">
                                            <app.icon className="size-5" />
                                        </div>
                                        <span className="font-medium text-sm">{app.name}</span>
                                    </div>
                                    {app.connected ? (
                                        <CheckCircle2 className="size-4 text-green-600" />
                                    ) : (
                                        <XCircle className="size-4 text-muted-foreground" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start" size="sm">
                                <Calendar className="size-4 mr-2" />
                                View Activity Log
                            </Button>
                            <Button variant="outline" className="w-full justify-start" size="sm">
                                <Building2 className="size-4 mr-2" />
                                Create New Project
                            </Button>
                            <Button variant="outline" className="w-full justify-start" size="sm">
                                <Users className="size-4 mr-2" />
                                Manage Roles
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}