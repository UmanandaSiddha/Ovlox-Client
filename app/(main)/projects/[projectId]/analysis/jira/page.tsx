"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    ArrowLeft,
    Bug,
    FileText,
    TrendingUp,
    Users,
    Calendar,
} from "lucide-react"
import { SiJira } from "react-icons/si"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation"
import { getJiraProjects } from "@/services/jira.service"
import type { JiraProject } from "@/types/api-types"
import { useOrg } from "@/hooks/useOrg"
import { useProject } from "@/hooks/useProject"

export default function JiraAnalysis() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const params = useParams()
    const { projectId } = params
    const { currentOrg } = useOrg()
    const { loadProject, currentProject } = useProject()

    const [selectedCategory, setSelectedCategory] = React.useState<"projects" | "issues" | "sprints">("projects")
    const [jiraProjects, setJiraProjects] = React.useState<JiraProject[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [selectedProject, setSelectedProject] = React.useState<JiraProject | null>(null)

    React.useEffect(() => {
        if (currentOrg?.id && projectId) {
            loadProject(currentOrg.id, projectId as string)
        }
    }, [currentOrg?.id, projectId])

    React.useEffect(() => {
        const tab = searchParams.get("tab")
        if (tab === "projects" || tab === "issues" || tab === "sprints") {
            setSelectedCategory(tab as any)
        } else {
            const params = new URLSearchParams(searchParams)
            params.set("tab", "projects")
            router.replace(`${pathname}?${params.toString()}`)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    React.useEffect(() => {
        const loadJiraProjects = async () => {
            // TODO: Get integration ID from project integrations
            // For now, we'll show a placeholder
            setIsLoading(false)
            setJiraProjects([])
        }

        loadJiraProjects()
    }, [projectId])

    const handleTabChange = (val: string) => {
        setSelectedCategory(val as any)
        setSelectedProject(null)
        const params = new URLSearchParams(searchParams)
        params.set("tab", val)
        router.replace(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-linear-to-br from-blue-600 to-blue-700 border border-border">
                        <SiJira className="size-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Jira Analysis</h1>
                        <p className="text-sm text-muted-foreground">
                            Track issues, sprints, and project progress
                        </p>
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={handleTabChange}>
                <TabsList className="grid w-full max-w-xl grid-cols-3">
                    <TabsTrigger value="projects" className="flex items-center gap-2">
                        <FileText className="size-4" />
                        <span>Projects</span>
                        <Badge variant="outline" className="ml-1 text-xs">{jiraProjects.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="issues" className="flex items-center gap-2">
                        <Bug className="size-4" />
                        <span>Issues</span>
                        <Badge variant="outline" className="ml-1 text-xs">0</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="sprints" className="flex items-center gap-2">
                        <Calendar className="size-4" />
                        <span>Sprints</span>
                        <Badge variant="outline" className="ml-1 text-xs">0</Badge>
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-6">
                    {/* Projects */}
                    <TabsContent value="projects" className="mt-0 space-y-3">
                        {isLoading ? (
                            <Card className="p-6 text-sm text-muted-foreground flex items-center gap-2">
                                <div className="space-y-3 animate-pulse w-full">
                                    <div className="h-4 w-3/4 bg-muted rounded" />
                                    <div className="h-4 w-1/2 bg-muted rounded" />
                                    <div className="h-32 bg-muted rounded" />
                                </div>
                            </Card>
                        ) : jiraProjects.length === 0 ? (
                            <Card className="p-12">
                                <div className="text-center">
                                    <SiJira className="size-12 text-muted-foreground mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold mb-2">No Jira Projects Found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Connect a Jira integration to start tracking issues and sprints
                                    </p>
                                    {currentOrg?.slug && (
                                        <Button onClick={() => router.push(`/organizations/${currentOrg.slug}/integrations`)}>
                                            <ArrowLeft className="size-4 mr-2" />
                                            Connect Jira Integration
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ) : (
                            jiraProjects.map((project) => (
                                <Card
                                    key={project.id}
                                    className="p-4 cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                                    onClick={() => setSelectedProject(project)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                                            <SiJira className="size-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium">{project.name}</p>
                                                <Badge variant="secondary">{project.key}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {project.projectTypeKey}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    {/* Issues */}
                    <TabsContent value="issues" className="mt-0 space-y-3">
                        <Card className="p-12">
                            <div className="text-center">
                                <Bug className="size-12 text-muted-foreground mx-auto mb-3" />
                                <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
                                <p className="text-muted-foreground">
                                    Issues will appear here once data is ingested from your Jira projects
                                </p>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Sprints */}
                    <TabsContent value="sprints" className="mt-0 space-y-3">
                        <Card className="p-12">
                            <div className="text-center">
                                <Calendar className="size-12 text-muted-foreground mx-auto mb-3" />
                                <h3 className="text-lg font-semibold mb-2">No Sprints Found</h3>
                                <p className="text-muted-foreground">
                                    Sprint data will appear here once your Jira integration is set up
                                </p>
                            </div>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
