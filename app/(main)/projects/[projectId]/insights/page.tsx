"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
    GitPullRequest,
    RefreshCw,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useOrg } from "@/hooks/useOrg"
import { useProject } from "@/hooks/useProject"
import { ExternalProvider } from "@/types/enum"
import { getGithubOverview, getGithubCommits, getGithubPullRequests, getGithubIssues, syncGithubRepositories } from "@/services/github.service"
import type { GitHubOverview, GitHubCommitSummary, GitHubPullRequest, GitHubIssue } from "@/types/api-types"

export default function Insights() {
    const params = useParams()
    const router = useRouter()
    const { projectId } = params
    const { currentOrg } = useOrg()
    const { loadProject, currentProject } = useProject()

    const [isLoading, setIsLoading] = React.useState(true)
    const [timeRange, setTimeRange] = React.useState<"week" | "month" | "quarter">("week")
    
    // GitHub data
    const [githubOverview, setGithubOverview] = React.useState<GitHubOverview | null>(null)
    const [commits, setCommits] = React.useState<GitHubCommitSummary[]>([])
    const [pullRequests, setPullRequests] = React.useState<GitHubPullRequest[]>([])
    const [issues, setIssues] = React.useState<GitHubIssue[]>([])
    
    // Track if data has been loaded to prevent duplicate calls
    const hasLoadedData = React.useRef(false)
    const loadingIntegrationId = React.useRef<string | null>(null)

    // Load project only if not already loaded
    React.useEffect(() => {
        if (currentOrg?.id && projectId && currentProject?.id !== projectId) {
            loadProject(currentOrg.id, projectId as string)
        }
    }, [currentOrg?.id, projectId, currentProject?.id, loadProject])

    // Get GitHub integration ID from project's linked integrations
    const githubIntegrationId = React.useMemo(() => {
        const connections = currentProject?.integrations || []
        const githubConnection = connections.find((conn) => conn.integration?.type === ExternalProvider.GITHUB)
        return githubConnection?.integrationId
    }, [currentProject])

    const fetchGitHubData = React.useCallback(async (forceRefresh = false) => {
        if (!githubIntegrationId || !projectId) {
            setIsLoading(false)
            return
        }
        
        // Prevent duplicate loads unless forced
        if (!forceRefresh && loadingIntegrationId.current === githubIntegrationId && hasLoadedData.current) {
            setIsLoading(false)
            return
        }
        
        loadingIntegrationId.current = githubIntegrationId
        setIsLoading(true)
        
        try {
            // Sync repos first (required before fetching data)
            await syncGithubRepositories(githubIntegrationId, projectId as string).catch(() => {
                // Ignore sync errors - repos might already be synced
            })
            
            const opts = { projectId: projectId as string }
            const [overview, commitsData, prsData, issuesData] = await Promise.all([
                getGithubOverview(githubIntegrationId, opts).catch(() => null),
                getGithubCommits(githubIntegrationId, opts).catch(() => []),
                getGithubPullRequests(githubIntegrationId, opts).catch(() => []),
                getGithubIssues(githubIntegrationId, opts).catch(() => []),
            ])
            
            setGithubOverview(overview)
            setCommits(commitsData)
            setPullRequests(prsData)
            setIssues(issuesData)
            hasLoadedData.current = true
        } catch (error) {
            console.error("Failed to fetch GitHub data:", error)
        } finally {
            setIsLoading(false)
        }
    }, [githubIntegrationId, projectId])

    React.useEffect(() => {
        fetchGitHubData()
    }, [fetchGitHubData])

    // Compute insights from real data
    const insights = React.useMemo(() => {
        const openPRs = pullRequests.filter(pr => pr.state === "open").length
        const openIssues = issues.filter(issue => issue.state === "open").length
        
        // Get unique contributors from commits
        const uniqueAuthors = new Set(commits.map(c => c.author).filter(Boolean))
        
        return {
            commits: githubOverview?.activity.commits || commits.length,
            pullRequests: githubOverview?.activity.pullRequests || pullRequests.length,
            issues: githubOverview?.activity.issues || issues.length,
            openPRs,
            openIssues,
            activeContributors: uniqueAuthors.size,
            repoName: githubOverview?.repo.name || "Repository",
            repoDescription: githubOverview?.repo.description,
            stars: githubOverview?.repo.stars || 0,
            forks: githubOverview?.repo.forks || 0,
            status: githubOverview?.status || "success",
        }
    }, [githubOverview, commits, pullRequests, issues])

    if (isLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold mb-2">Insights</h1>
                    <p className="text-muted-foreground">Analytics and insights for your project</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="p-6">
                            <div className="animate-pulse space-y-3">
                                <div className="h-4 w-1/2 bg-muted rounded" />
                                <div className="h-8 w-1/3 bg-muted rounded" />
                                <div className="h-3 w-2/3 bg-muted rounded" />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    const hasGitHubData = githubIntegrationId && (githubOverview || commits.length > 0)

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold mb-2">Insights</h1>
                    <p className="text-muted-foreground">Analytics and insights for your project</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => fetchGitHubData(true)} disabled={isLoading}>
                    <RefreshCw className={`size-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {!hasGitHubData ? (
                <Card className="p-12">
                    <div className="text-center">
                        <BarChart3 className="size-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                            Connect GitHub to your project to see commits, pull requests, issues, and other insights.
                        </p>
                        <Button onClick={() => router.push(`/organizations/${currentOrg?.slug}/integrations`)}>
                            Connect Integrations
                        </Button>
                    </div>
                </Card>
            ) : (
                <>
                    {/* Repository Info */}
                    {githubOverview && (
                        <Card className="p-4 mb-6 bg-muted/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <GitCommit className="size-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{insights.repoName}</p>
                                        {insights.repoDescription && (
                                            <p className="text-sm text-muted-foreground">{insights.repoDescription}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>⭐ {insights.stars}</span>
                                    <span>🍴 {insights.forks}</span>
                                    <Badge variant={insights.status === "success" ? "default" : "destructive"}>
                                        {insights.status === "success" ? "Healthy" : "Needs Attention"}
                                    </Badge>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card 
                            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => router.push(`/projects/${projectId}/analysis/github?tab=commits`)}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Commits</span>
                                <GitCommit className="size-4 text-muted-foreground" />
                            </div>
                            <div className="text-3xl font-bold">{insights.commits}</div>
                            <p className="text-xs text-muted-foreground mt-2">Recent commits</p>
                        </Card>

                        <Card 
                            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => router.push(`/projects/${projectId}/analysis/github?tab=prs`)}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Pull Requests</span>
                                <GitPullRequest className="size-4 text-muted-foreground" />
                            </div>
                            <div className="text-3xl font-bold">{insights.pullRequests}</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {insights.openPRs > 0 ? `${insights.openPRs} open` : "All closed"}
                            </p>
                        </Card>

                        <Card 
                            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => router.push(`/projects/${projectId}/analysis/github?tab=issues`)}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Issues</span>
                                <AlertCircle className="size-4 text-muted-foreground" />
                            </div>
                            <div className="text-3xl font-bold">{insights.issues}</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {insights.openIssues > 0 ? `${insights.openIssues} open` : "All resolved"}
                            </p>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Contributors</span>
                                <Users className="size-4 text-muted-foreground" />
                            </div>
                            <div className="text-3xl font-bold">{insights.activeContributors}</div>
                            <p className="text-xs text-muted-foreground mt-2">Active contributors</p>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Commits */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Recent Commits</h3>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => router.push(`/projects/${projectId}/analysis/github?tab=commits`)}
                                >
                                    View All
                                </Button>
                            </div>
                            {commits.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No recent commits</p>
                            ) : (
                                <div className="space-y-3">
                                    {commits.slice(0, 5).map((commit) => (
                                        <div key={commit.sha} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                            <GitCommit className="size-4 text-muted-foreground mt-1 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate">{commit.message}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {commit.author} • {new Date(commit.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-xs text-muted-foreground shrink-0">
                                                <span className="text-green-500">+{commit.additions}</span>
                                                {" / "}
                                                <span className="text-red-500">-{commit.deletions}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>

                        {/* Recent PRs */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Recent Pull Requests</h3>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => router.push(`/projects/${projectId}/analysis/github?tab=prs`)}
                                >
                                    View All
                                </Button>
                            </div>
                            {pullRequests.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No recent pull requests</p>
                            ) : (
                                <div className="space-y-3">
                                    {pullRequests.slice(0, 5).map((pr) => (
                                        <div key={pr.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                            <GitPullRequest className={`size-4 mt-1 shrink-0 ${
                                                pr.state === "open" ? "text-green-500" : pr.merged ? "text-purple-500" : "text-red-500"
                                            }`} />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate">{pr.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    #{pr.number} • {pr.commits} commits
                                                </p>
                                            </div>
                                            <Badge 
                                                variant="outline" 
                                                className={`shrink-0 text-xs ${
                                                    pr.state === "open" 
                                                        ? "border-green-500/30 text-green-500" 
                                                        : pr.merged 
                                                            ? "border-purple-500/30 text-purple-500" 
                                                            : "border-red-500/30 text-red-500"
                                                }`}
                                            >
                                                {pr.merged ? "Merged" : pr.state}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}
