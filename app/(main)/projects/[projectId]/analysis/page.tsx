"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    Sparkles,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Clock,
    GitBranch,
    MessageSquare,
    Calendar,
    FileText,
    Code,
    ExternalLink,
} from "lucide-react"
import { SiGithub, SiJira, SiSlack, SiDiscord } from "react-icons/si"
import { useRouter, useParams } from "next/navigation"
import { getGithubOverview } from "@/services/github.service"
import type { GitHubOverview } from "@/types/api-types"
import { useOrg } from "@/hooks/useOrg"
import { useProject } from "@/hooks/useProject"
import { appIconMap } from "@/lib/app.icons"
import { ExternalProvider } from "@/types/enum"

type DataSource = {
    id: string
    name: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    bgColor: string
    count: number
}

type Summary = {
    id: string
    source: string
    title: string
    type: "update" | "issue" | "success" | "info"
    content: string
    highlights: string[]
    timestamp: Date
    metrics?: { label: string; value: string }[]
}

const dataSources: DataSource[] = [
    { id: "all", name: "All Sources", icon: Sparkles, color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950", count: 0 },
    { id: "github", name: "GitHub", icon: SiGithub, color: "text-gray-900 dark:text-gray-100", bgColor: "bg-gray-50 dark:bg-gray-900", count: 0 },
    { id: "jira", name: "Jira", icon: SiJira, color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950", count: 0 },
    { id: "slack", name: "Slack", icon: SiSlack, color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950", count: 0 },
    { id: "discord", name: "Discord", icon: SiDiscord, color: "text-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-950", count: 0 },
]

export default function Analysis() {
    const router = useRouter()
    const params = useParams()
    const { projectId, slug } = params
    const { currentOrg } = useOrg()
    const { loadProject, currentProject } = useProject()

    const [selectedSource, setSelectedSource] = React.useState("all")
    const [githubOverview, setGithubOverview] = React.useState<GitHubOverview | null>(null)
    const [isLoadingGithub, setIsLoadingGithub] = React.useState(true)

    React.useEffect(() => {
        if (currentOrg?.id && projectId) {
            loadProject(currentOrg.id, projectId as string)
        }
    }, [currentOrg?.id, projectId])

    React.useEffect(() => {
        const fetchGithubOverview = async () => {
            if (!projectId) return
            try {
                setIsLoadingGithub(true)
                const data = await getGithubOverview(projectId as string)
                setGithubOverview(data)
            } catch (error) {
                console.error("Failed to fetch GitHub overview:", error)
            } finally {
                setIsLoadingGithub(false)
            }
        }

        if (projectId) {
            fetchGithubOverview()
        }
    }, [projectId])

    // Mock summaries - replace with actual API call
    const summaries: Summary[] = React.useMemo(() => {
        const baseSummaries: Summary[] = []
        
        if (githubOverview) {
            baseSummaries.push({
                id: "1",
                source: "github",
                title: "Repository Activity Summary",
                type: "success",
                content: `Active development on ${githubOverview.repo.name} repository${githubOverview.repo.description ? `: ${githubOverview.repo.description}` : ""}`,
                highlights: [
                    `${githubOverview.activity.commits} commits pushed`,
                    `${githubOverview.activity.pullRequests} pull requests`,
                    `${githubOverview.activity.issues} issues tracked`,
                ],
                timestamp: new Date(),
                metrics: [
                    { label: "Commits", value: `${githubOverview.activity.commits}` },
                    { label: "PRs", value: `${githubOverview.activity.pullRequests}` },
                    { label: "Issues", value: `${githubOverview.activity.issues}` }
                ]
            })
        }

        return baseSummaries
    }, [githubOverview])

    const filteredSummaries = React.useMemo(() => {
        if (selectedSource === "all") return summaries
        return summaries.filter(s => s.source === selectedSource)
    }, [summaries, selectedSource])

    const handleSourceChange = (id: string) => {
        setSelectedSource(id)
    }

    const getTypeIcon = (type: Summary["type"]) => {
        switch (type) {
            case "success": return <CheckCircle2 className="size-4 text-green-600" />
            case "issue": return <AlertCircle className="size-4 text-red-600" />
            case "update": return <TrendingUp className="size-4 text-blue-600" />
            default: return <Clock className="size-4 text-gray-600" />
        }
    }

    const getTypeBadge = (type: Summary["type"]) => {
        const variants: Record<Summary["type"], string> = {
            success: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
            issue: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
            update: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
            info: "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
        }
        return variants[type]
    }

    const handleChatClick = () => {
        if (currentOrg?.slug && projectId) {
            router.push(`/projects/${projectId}/chat`)
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Data Source Analysis</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        AI-generated summaries and insights from all connected sources
                    </p>
                </div>
                <Button onClick={handleChatClick} className="gap-2">
                    <Sparkles className="size-4" />
                    Ask AI Assistant
                </Button>
            </div>

            {/* Data Source Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {dataSources.map((source) => {
                    const Icon = source.icon
                    return (
                        <button
                            key={source.id}
                            onClick={() => handleSourceChange(source.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                                selectedSource === source.id
                                    ? `${source.bgColor} border-current`
                                    : "bg-background hover:bg-muted"
                            }`}
                        >
                            <Icon className={`size-4 ${selectedSource === source.id ? source.color : "text-muted-foreground"}`} />
                            <span className={`text-sm font-medium ${selectedSource === source.id ? source.color : "text-foreground"}`}>
                                {source.name}
                            </span>
                            {source.count > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                    {source.count}
                                </Badge>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Summaries Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredSummaries.map((summary) => {
                    const sourceData = dataSources.find(s => s.id === summary.source)
                    const SourceIcon = sourceData?.icon || FileText
                    const isGithub = summary.source === "github"

                    // Special rendering for GitHub Repository Activity Summary
                    if (summary.id === "1" && githubOverview) {
                        return (
                            <Card
                                key={summary.id}
                                className="p-5 hover:shadow-xl hover:border-primary/30 transition-all duration-200 border-border/50 cursor-pointer"
                                onClick={() => {
                                    if (currentOrg?.slug) {
                                        router.push(`/projects/${projectId}/analysis/github`)
                                    }
                                }}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-lg ${sourceData?.bgColor}`}>
                                            <SourceIcon className={`size-4 ${sourceData?.color}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm">Repository Activity Summary</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {githubOverview.repo.name} • {sourceData?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge("success")}`}>
                                        {getTypeIcon("success")}
                                        <span className="capitalize">Live</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <p className="text-sm text-muted-foreground mb-4">
                                    {summary.content}
                                </p>

                                {/* Metrics */}
                                <div className="flex gap-4 mb-4 pb-4 border-b">
                                    {summary.metrics?.map((metric, idx) => (
                                        <div key={idx}>
                                            <p className="text-xs text-muted-foreground">{metric.label}</p>
                                            <p className="text-lg font-bold">{metric.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Repository Info */}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <span>⭐</span>
                                        <span>{githubOverview.repo.stars} stars</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span>🍴</span>
                                        <span>{githubOverview.repo.forks} forks</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span>🌿</span>
                                        <span>{githubOverview.repo.defaultBranch}</span>
                                    </div>
                                </div>

                                {/* Highlights */}
                                {summary.highlights.length > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <p className="text-xs font-semibold text-muted-foreground mb-2">KEY HIGHLIGHTS</p>
                                        <ul className="space-y-1.5">
                                            {summary.highlights.map((highlight, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm">
                                                    <span className="text-primary mt-0.5">•</span>
                                                    <span>{highlight}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </Card>
                        )
                    }

                    const handleCardClick = () => {
                        if (!currentOrg?.slug) return
                        const analysisRoutes: Record<string, string> = {
                            github: "github",
                            jira: "jira",
                            slack: "slack",
                            discord: "discord",
                        }
                        const route = analysisRoutes[summary.source]
                        if (route) {
                            router.push(`/projects/${projectId}/analysis/${route}`)
                        }
                    }

                    return (
                        <Card
                            key={summary.id}
                            className={`p-5 hover:shadow-xl hover:border-primary/30 transition-all duration-200 border-border/50 ${["github", "jira", "slack", "discord"].includes(summary.source) ? "cursor-pointer" : ""}`}
                            onClick={["github", "jira", "slack", "discord"].includes(summary.source) ? handleCardClick : undefined}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg ${sourceData?.bgColor}`}>
                                        <SourceIcon className={`size-4 ${sourceData?.color}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">{summary.title}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {summary.timestamp.toLocaleTimeString()} • {sourceData?.name}
                                        </p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(summary.type)}`}>
                                    {getTypeIcon(summary.type)}
                                    <span className="capitalize">{summary.type}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <p className="text-sm text-muted-foreground mb-4">
                                {summary.content}
                            </p>

                            {/* Metrics */}
                            {summary.metrics && summary.metrics.length > 0 && (
                                <div className="flex gap-4 mb-4 pb-4 border-b">
                                    {summary.metrics.map((metric, idx) => (
                                        <div key={idx}>
                                            <p className="text-xs text-muted-foreground">{metric.label}</p>
                                            <p className="text-lg font-bold">{metric.value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Highlights */}
                            {summary.highlights.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground mb-2">KEY HIGHLIGHTS</p>
                                    <ul className="space-y-1.5">
                                        {summary.highlights.map((highlight, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                <span className="text-primary mt-0.5">•</span>
                                                <span>{highlight}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </Card>
                    )
                })}
            </div>

            {filteredSummaries.length === 0 && (
                <Card className="p-12">
                    <div className="text-center">
                        <FileText className="size-12 text-muted-foreground mx-auto mb-3" />
                        <h3 className="text-lg font-semibold mb-2">No summaries found</h3>
                        <p className="text-muted-foreground mb-4">
                            {selectedSource === "all"
                                ? "Connect integrations to start generating AI-powered summaries"
                                : `No summaries found for ${dataSources.find(s => s.id === selectedSource)?.name}`}
                        </p>
                        {selectedSource === "all" && (
                            <Button onClick={() => {
                                if (currentOrg?.slug) {
                                    router.push(`/organizations/${currentOrg.slug}/integrations`)
                                }
                            }}>
                                <ExternalLink className="size-4 mr-2" />
                                Connect Integrations
                            </Button>
                        )}
                    </div>
                </Card>
            )}
        </div>
    )
}
