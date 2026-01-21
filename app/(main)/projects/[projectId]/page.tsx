"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
    BarChart3,
    Sparkles,
    GitCommit,
    GitPullRequest,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { getProject } from "@/services/project.service"
import { IProject } from "@/types/prisma-generated"
import { useOrg } from "@/hooks/useOrg"
import { useProject } from "@/hooks/useProject"
import { appIconMap } from "@/lib/app.icons"
import { ExternalProvider } from "@/types/enum"
import { getGithubOverview, syncGithubRepositories, getProjectRepositories } from "@/services/github.service"
import type { GitHubOverview, ProjectRepository } from "@/types/api-types"

export default function ProjectDetail() {
    const params = useParams()
    const router = useRouter()
    const { slug } = params
    const { projectId } = params
    const { currentOrg } = useOrg()
    const { loadProject, currentProject } = useProject()

    const [project, setProject] = React.useState<IProject | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [githubOverview, setGithubOverview] = React.useState<GitHubOverview | null>(null)
    const [githubRepos, setGithubRepos] = React.useState<ProjectRepository[]>([])
    
    // Track if GitHub data has been loaded to prevent duplicate calls
    const hasLoadedGithubData = React.useRef(false)
    const loadingIntegrationId = React.useRef<string | null>(null)

    // Load project only if not already loaded or different project
    React.useEffect(() => {
        if (currentOrg?.id && projectId && currentProject?.id !== projectId) {
            fetchProject()
        } else if (currentProject?.id === projectId) {
            setProject(currentProject)
            setIsLoading(false)
        }
    }, [currentOrg?.id, projectId, currentProject?.id])

    const fetchProject = async () => {
        if (!currentOrg?.id || !projectId) return
        setIsLoading(true)
        try {
            const proj = await loadProject(currentOrg.id, projectId as string)
            setProject(proj)
        } catch (error) {
            console.error("Failed to load project", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Get GitHub integration ID from project's linked integrations
    const githubIntegrationId = React.useMemo(() => {
        const connections = project?.integrations || []
        const githubConnection = connections.find((conn) => conn.integration?.type === ExternalProvider.GITHUB)
        return githubConnection?.integrationId
    }, [project])

    // Fetch GitHub data when integration ID is available
    React.useEffect(() => {
        const fetchGithubData = async () => {
            if (!githubIntegrationId || !projectId) return
            
            // Prevent duplicate loads for the same integration
            if (loadingIntegrationId.current === githubIntegrationId && hasLoadedGithubData.current) {
                return
            }
            
            loadingIntegrationId.current = githubIntegrationId
            
            try {
                // Sync repos first (required before fetching data)
                await syncGithubRepositories(githubIntegrationId, projectId as string).catch(() => {
                    // Ignore sync errors - repos might already be synced
                })
                
                // Fetch overview and repositories in parallel
                const [overview, reposResponse] = await Promise.all([
                    getGithubOverview(githubIntegrationId, { projectId: projectId as string }).catch(() => null),
                    getProjectRepositories(githubIntegrationId, projectId as string).catch(() => ({ repositories: [] })),
                ])
                
                setGithubOverview(overview)
                setGithubRepos(reposResponse.repositories || [])
                hasLoadedGithubData.current = true
            } catch (error) {
                console.error("Failed to fetch GitHub data:", error)
            }
        }
        fetchGithubData()
    }, [githubIntegrationId, projectId])

    if (isLoading) {
        return (
            <div className="p-6">
                <p>Loading project...</p>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="p-6">
                <p>Project not found</p>
            </div>
        )
    }

    const integrations = project.integrations || []
    const integrationTypes = integrations.map(i => i.integration?.type).filter(Boolean) as ExternalProvider[]

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 rounded-lg">
                            <AvatarFallback className="rounded-lg text-2xl font-bold bg-linear-to-br from-primary/20 to-primary/10">
                                {project.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-bold">{project.name}</h1>
                            <p className="text-muted-foreground mt-1">{project.description || "No description"}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary">{project.slug}</Badge>
                                {integrationTypes.map((type) => {
                                    const Icon = appIconMap[type]
                                    return Icon ? <Icon key={type} className="size-4" /> : null
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline">
                            <Share2 className="size-4 mr-2" />
                            Share
                        </Button>
                        <Button>
                            <Settings className="size-4 mr-2" />
                            Settings
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card 
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer" 
                    onClick={() => router.push(`/projects/${project.id}/analysis/github?tab=commits`)}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Commits</span>
                        <GitCommit className="size-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold">{githubOverview?.activity.commits || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Recent commits</p>
                </Card>

                <Card 
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer" 
                    onClick={() => router.push(`/projects/${project.id}/analysis/github?tab=prs`)}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Pull Requests</span>
                        <GitPullRequest className="size-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold">{githubOverview?.activity.pullRequests || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Recent PRs</p>
                </Card>

                <Card 
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer" 
                    onClick={() => router.push(`/projects/${project.id}/analysis/github?tab=issues`)}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Issues</span>
                        <AlertCircle className="size-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold">{githubOverview?.activity.issues || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Tracked issues</p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Integrations</span>
                        <GitBranch className="size-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold">{integrations.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Connected</p>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/projects/${project.id}/chat`)}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                            <Sparkles className="size-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">AI Assistant</h3>
                            <p className="text-sm text-muted-foreground">Chat with your project data</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/projects/${project.id}/tasks`)}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-500/10">
                            <FileText className="size-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Tasks</h3>
                            <p className="text-sm text-muted-foreground">Manage project tasks</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/projects/${project.id}/insights`)}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-green-500/10">
                            <BarChart3 className="size-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Insights</h3>
                            <p className="text-sm text-muted-foreground">View project analytics</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/projects/${project.id}/analysis`)}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-purple-500/10">
                            <GitBranch className="size-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Analysis</h3>
                            <p className="text-sm text-muted-foreground">View data source analysis</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/projects/${project.id}/events`)}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-orange-500/10">
                            <Calendar className="size-6 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Events</h3>
                            <p className="text-sm text-muted-foreground">View project timeline</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Linked Integrations */}
            {integrations.length > 0 && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Linked Integrations</h2>
                    <div className="space-y-4">
                        {integrations.map((connection) => {
                            const integration = connection.integration
                            if (!integration) return null
                            const Icon = appIconMap[integration.type]
                            const isGithub = integration.type === ExternalProvider.GITHUB
                            const items = connection.items || {}
                            
                            return (
                                <div key={connection.id} className="border border-border rounded-lg overflow-hidden">
                                    {/* Integration Header */}
                                    <div className="flex items-center justify-between p-4 bg-muted/30">
                                        <div className="flex items-center gap-3">
                                            {Icon && <Icon className="size-5" />}
                                            <span className="font-medium capitalize">{integration.type.toLowerCase()}</span>
                                        </div>
                                        <Badge variant="secondary">
                                            {isGithub ? githubRepos.length : Object.keys(items).length} resources
                                        </Badge>
                                    </div>
                                    
                                    {/* GitHub Repositories */}
                                    {isGithub && githubRepos.length > 0 && (
                                        <div className="p-4 pt-2 space-y-2">
                                            {githubRepos.map((repo) => (
                                                <div 
                                                    key={repo.name} 
                                                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer"
                                                    onClick={() => window.open(repo.url, '_blank')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <GitBranch className="size-4 text-muted-foreground" />
                                                        <span className="text-sm font-medium">{repo.name}</span>
                                                        {!repo.accessible && (
                                                            <Badge variant="destructive" className="text-xs">Inaccessible</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        {repo.pushed_at && (
                                                            <span>Updated {new Date(repo.pushed_at).toLocaleDateString()}</span>
                                                        )}
                                                        <ArrowUpRight className="size-3" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Other Integrations - show items */}
                                    {!isGithub && Object.keys(items).length > 0 && (
                                        <div className="p-4 pt-2 space-y-2">
                                            {Object.entries(items).map(([key, value]) => (
                                                <div 
                                                    key={key} 
                                                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium capitalize">{key}</span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {Array.isArray(value) ? `${value.length} items` : String(value)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </Card>
            )}
        </div>
    )
}
