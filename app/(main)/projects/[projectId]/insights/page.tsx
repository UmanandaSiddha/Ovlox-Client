"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Activity,
    Users,
    GitCommit,
    MessageSquare,
    Calendar,
    AlertCircle,
    CheckCircle2,
} from "lucide-react"
import { useParams } from "next/navigation"
import { useOrg } from "@/hooks/useOrg"
import { useProject } from "@/hooks/useProject"

export default function Insights() {
    const params = useParams()
    const { projectId } = params
    const { currentOrg } = useOrg()
    const { loadProject, currentProject } = useProject()

    const [isLoading, setIsLoading] = React.useState(false)
    const [timeRange, setTimeRange] = React.useState<"week" | "month" | "quarter">("week")

    React.useEffect(() => {
        if (currentOrg?.id && projectId) {
            loadProject(currentOrg.id, projectId as string)
        }
    }, [currentOrg?.id, projectId])

    // Mock insights data - replace with actual API call
    const insights = React.useMemo(() => {
        return {
            commits: 0,
            pullRequests: 0,
            messages: 0,
            activeContributors: 0,
            velocity: 0,
            trends: {
                commits: 0,
                prs: 0,
                messages: 0,
            },
        }
    }, [])

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-2">Insights</h1>
                <p className="text-muted-foreground">Analytics and insights for your project</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Commits</span>
                        <GitCommit className="size-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold">{insights.commits}</div>
                    <div className="flex items-center gap-1 mt-2 text-xs">
                        {insights.trends.commits >= 0 ? (
                            <>
                                <TrendingUp className="size-3 text-green-600" />
                                <span className="text-green-600">+{insights.trends.commits}%</span>
                            </>
                        ) : (
                            <>
                                <TrendingDown className="size-3 text-red-600" />
                                <span className="text-red-600">{insights.trends.commits}%</span>
                            </>
                        )}
                        <span className="text-muted-foreground">vs last period</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Pull Requests</span>
                        <Activity className="size-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold">{insights.pullRequests}</div>
                    <div className="flex items-center gap-1 mt-2 text-xs">
                        {insights.trends.prs >= 0 ? (
                            <>
                                <TrendingUp className="size-3 text-green-600" />
                                <span className="text-green-600">+{insights.trends.prs}%</span>
                            </>
                        ) : (
                            <>
                                <TrendingDown className="size-3 text-red-600" />
                                <span className="text-red-600">{insights.trends.prs}%</span>
                            </>
                        )}
                        <span className="text-muted-foreground">vs last period</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Messages</span>
                        <MessageSquare className="size-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold">{insights.messages}</div>
                    <div className="flex items-center gap-1 mt-2 text-xs">
                        {insights.trends.messages >= 0 ? (
                            <>
                                <TrendingUp className="size-3 text-green-600" />
                                <span className="text-green-600">+{insights.trends.messages}%</span>
                            </>
                        ) : (
                            <>
                                <TrendingDown className="size-3 text-red-600" />
                                <span className="text-red-600">{insights.trends.messages}%</span>
                            </>
                        )}
                        <span className="text-muted-foreground">vs last period</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Active Contributors</span>
                        <Users className="size-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold">{insights.activeContributors}</div>
                    <p className="text-xs text-muted-foreground mt-2">This {timeRange}</p>
                </Card>
            </div>

            {/* Activity Chart Placeholder */}
            <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Activity Overview</h2>
                    <div className="flex items-center gap-2">
                        <Badge variant={timeRange === "week" ? "default" : "outline"}>Week</Badge>
                        <Badge variant={timeRange === "month" ? "default" : "outline"}>Month</Badge>
                        <Badge variant={timeRange === "quarter" ? "default" : "outline"}>Quarter</Badge>
                    </div>
                </div>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                        <BarChart3 className="size-12 mx-auto mb-2" />
                        <p>Activity chart will appear here</p>
                        <p className="text-sm">Connect integrations to see data</p>
                    </div>
                </div>
            </Card>

            {/* Additional Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Project Health</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Code Quality</span>
                            <Badge variant="default">
                                <CheckCircle2 className="size-3 mr-1" />
                                Good
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Activity Level</span>
                            <Badge variant="outline">Normal</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Response Time</span>
                            <Badge variant="default">Fast</Badge>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Highlights</h3>
                    <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                            No highlights yet. Connect integrations to start tracking project activity.
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
