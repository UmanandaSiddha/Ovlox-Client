"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
    FolderKanban,
    Users,
    Database,
    Settings as SettingsIcon,
    ArrowRight,
    ArrowLeft,
    Check,
    X,
    Plus,
    Search,
    CheckCircle2,
    Calendar,
    Target,
    Upload,
    Loader2
} from "lucide-react"
import { SiGithub, SiSlack, SiDiscord, SiJira } from "react-icons/si"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useOrg } from "@/hooks/useOrg"
import { toast } from "sonner"
import { listIntegrations } from "@/services/integration.service"
import { getGithubRepositories } from "@/services/github.service"
import type { GitHubRepo } from "@/types/api-types"
import { ExternalProvider, IntegrationStatus } from "@/types/enum"

type Step = "details" | "members" | "datasources" | "settings"

type Member = {
    id: string
    name: string
    email: string
    avatar?: string
    role: "owner" | "admin" | "member"
}

type ProjectMember = {
    memberId: string
    access: "view" | "edit" | "admin"
}

type DataSource = {
    id: string
    name: string
    type: string
    icon: React.ReactNode
    description: string
    enabled: boolean
    config?: {
        repositories?: string[]
        channels?: string[]
        boards?: string[]
    }
}

const availableMembers: Member[] = [
    { id: "1", name: "John Doe", email: "john@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John", role: "owner" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane", role: "admin" },
    { id: "3", name: "Bob Wilson", email: "bob@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob", role: "member" },
    { id: "4", name: "Alice Johnson", email: "alice@example.com", role: "member" },
    { id: "5", name: "Charlie Brown", email: "charlie@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie", role: "admin" },
]

const connectedApps: DataSource[] = [
    {
        id: "github",
        name: "GitHub",
        type: "repository",
        icon: <SiGithub className="size-6" />,
        description: "Track commits, pull requests, and issues",
        enabled: false,
        config: { repositories: ["frontend-app", "backend-api", "mobile-app"] }
    },
    {
        id: "slack",
        name: "Slack",
        type: "communication",
        icon: <SiSlack className="size-6" />,
        description: "Monitor channels and messages",
        enabled: false,
        config: { channels: ["#general", "#development", "#design"] }
    },
    {
        id: "jira",
        name: "Jira",
        type: "project-management",
        icon: <SiJira className="size-6" />,
        description: "Import tickets and track progress",
        enabled: false,
        config: { boards: ["Sprint Board", "Backlog", "Kanban"] }
    },
]

export default function NewProject() {
    const [currentStep, setCurrentStep] = React.useState<Step>("details")
    const [projectName, setProjectName] = React.useState("")
    const [projectDescription, setProjectDescription] = React.useState("")
    const [projectKey, setProjectKey] = React.useState("")
    const [startDate, setStartDate] = React.useState("")
    const [endDate, setEndDate] = React.useState("")
    const [projectMembers, setProjectMembers] = React.useState<ProjectMember[]>([])
    const [searchQuery, setSearchQuery] = React.useState("")
    const [dataSources, setDataSources] = React.useState<DataSource[]>(connectedApps)
    const [autoSync, setAutoSync] = React.useState(true)
    const [notifications, setNotifications] = React.useState(true)
    const [visibility, setVisibility] = React.useState<"public" | "private">("private")

    const router = useRouter()
    const { currentOrg } = useOrg()
    const [isCreating, setIsCreating] = React.useState(false)

    const steps = [
        { id: "details", label: "Project Details", icon: FolderKanban },
        { id: "members", label: "Team Access", icon: Users },
        { id: "datasources", label: "Data Sources", icon: Database },
        { id: "settings", label: "Settings", icon: SettingsIcon },
    ]

    const filteredMembers = React.useMemo(() => {
        if (!searchQuery) return availableMembers
        return availableMembers.filter((member) =>
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [searchQuery])

    const toggleMember = (memberId: string, access: "view" | "edit" | "admin") => {
        const existing = projectMembers.find(m => m.memberId === memberId)
        if (existing) {
            setProjectMembers(projectMembers.filter(m => m.memberId !== memberId))
        } else {
            setProjectMembers([...projectMembers, { memberId, access }])
        }
    }

    const updateMemberAccess = (memberId: string, access: "view" | "edit" | "admin") => {
        setProjectMembers(projectMembers.map(m =>
            m.memberId === memberId ? { ...m, access } : m
        ))
    }

    const toggleDataSource = (id: string) => {
        setDataSources((prev) => {
            const next = prev.map((ds) => (ds.id === id ? { ...ds, enabled: !ds.enabled } : ds))
            const github = next.find((ds) => ds.id === "github")
            if (id === "github" && github && !github.enabled) {
                setGithubRepos([])
                setGithubRepoQuery("")
                setSelectedGithubRepos([])
            }
            return next
        })
    }

    // Note: `githubEnabled` is declared further below; to avoid TDZ issues, compute locally here.
    const isGithubEnabled = dataSources.find((ds) => ds.id === "github")?.enabled ?? false
    React.useEffect(() => {
        if (currentStep !== "datasources") return
        if (!isGithubEnabled) return
        if (githubRepos.length > 0 || isLoadingGithubRepos) return
        loadGithubRepos()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, isGithubEnabled, currentOrg?.id])

    const canProceed = () => {
        if (currentStep === "details") {
            return projectName.trim().length > 0 && projectKey.trim().length > 0
        }
        return true
    }

    const handleNext = () => {
        if (currentStep === "details") setCurrentStep("members")
        else if (currentStep === "members") setCurrentStep("datasources")
        else if (currentStep === "datasources") setCurrentStep("settings")
    }

    const handleBack = () => {
        if (currentStep === "settings") setCurrentStep("datasources")
        else if (currentStep === "datasources") setCurrentStep("members")
        else if (currentStep === "members") setCurrentStep("details")
    }

    const [githubIntegrationId, setGithubIntegrationId] = React.useState<string | null>(null)
    const [githubRepos, setGithubRepos] = React.useState<GitHubRepo[]>([])
    const [githubRepoQuery, setGithubRepoQuery] = React.useState("")
    const [selectedGithubRepos, setSelectedGithubRepos] = React.useState<string[]>([])
    const [isLoadingGithubRepos, setIsLoadingGithubRepos] = React.useState(false)

    const githubEnabled = React.useMemo(() => {
        return dataSources.find((ds) => ds.id === "github")?.enabled ?? false
    }, [dataSources])

    const filteredGithubRepos = React.useMemo(() => {
        if (!githubRepoQuery.trim()) return githubRepos
        const q = githubRepoQuery.toLowerCase()
        return githubRepos.filter((r) => (r.full_name || r.name).toLowerCase().includes(q))
    }, [githubRepos, githubRepoQuery])

    const toggleGithubRepo = (fullName: string) => {
        setSelectedGithubRepos((prev) => {
            if (prev.includes(fullName)) return prev.filter((x) => x !== fullName)
            return [...prev, fullName]
        })
    }

    const loadGithubRepos = async () => {
        if (!currentOrg?.id) return
        setIsLoadingGithubRepos(true)
        try {
            const integrationsRes = await listIntegrations(currentOrg.id);
            const githubIntegration = (integrationsRes || []).find((i) => i.app === ExternalProvider.GITHUB)
            if (!githubIntegration) {
                toast.error("GitHub integration not found for this organization. Please connect GitHub first.")
                setGithubIntegrationId(null)
                setGithubRepos([])
                return
            }
            if (githubIntegration.status !== IntegrationStatus.CONNECTED) {
                toast.error("GitHub is not connected yet. Please complete GitHub setup in Integrations first.")
                setGithubIntegrationId(githubIntegration.integrationId)
                setGithubRepos([])
                return
            }

            setGithubIntegrationId(githubIntegration.integrationId)
            const repos = await getGithubRepositories(githubIntegration.integrationId)
            setGithubRepos(repos || [])
        } catch (error: any) {
            console.error("Failed to load GitHub repositories", error)
            toast.error(error?.response?.data?.message || "Failed to load GitHub repositories")
            setGithubRepos([])
        } finally {
            setIsLoadingGithubRepos(false)
        }
    }

    const handleCreate = async () => {
        if (!currentOrg?.id) {
            toast.error("Please select an organization first")
            return
        }

        if (githubEnabled) {
            if (!githubIntegrationId) {
                toast.error("GitHub integration is not available. Please connect GitHub in Integrations first.")
                return
            }
            if (selectedGithubRepos.length === 0) {
                toast.error("Please select at least one GitHub repository.")
                return
            }
        }

        setIsCreating(true)
        try {
            const { createProject, linkIntegration } = await import("@/services/project.service")
            const project = await createProject(currentOrg.id, {
                name: projectName,
                description: projectDescription || undefined,
            })

            if (githubEnabled && githubIntegrationId && selectedGithubRepos.length > 0) {
                try {
                    await linkIntegration(currentOrg.id, project.id, {
                        integrationId: githubIntegrationId,
                        items: { repositories: selectedGithubRepos },
                    })
                } catch (e: any) {
                    console.error("Failed to link GitHub repositories to project", e)
                    toast.error(e?.response?.data?.message || "Project created, but failed to link GitHub repositories.")
                }
            }

            toast.success("Project created successfully!")
            router.push(`/projects/${project.id}`)
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to create project")
        } finally {
            setIsCreating(false)
        }
    }

    const getStepIndex = (step: Step) => steps.findIndex(s => s.id === step)
    const currentStepIndex = getStepIndex(currentStep)

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
                    <p className="text-muted-foreground">Set up your project workspace and configure team access</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const StepIcon = step.icon
                            const isActive = currentStep === step.id
                            const isCompleted = getStepIndex(step.id as Step) < currentStepIndex

                            return (
                                <React.Fragment key={step.id}>
                                    <div className="flex flex-col items-center gap-2">
                                        <div
                                            className={`flex items-center justify-center size-12 rounded-full border-2 transition-colors ${isCompleted
                                                ? "bg-primary border-primary text-primary-foreground"
                                                : isActive
                                                    ? "bg-primary/10 border-primary text-primary"
                                                    : "bg-background border-border text-muted-foreground"
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <Check className="size-6" />
                                            ) : (
                                                <StepIcon className="size-6" />
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                                                {step.label}
                                            </p>
                                        </div>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`flex-1 h-0.5 mx-4 transition-colors ${getStepIndex(step.id as Step) < currentStepIndex
                                                ? "bg-primary"
                                                : "bg-border"
                                                }`}
                                        />
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </div>
                </div>

                {/* Form Content */}
                <Card className="p-8">
                    {/* Step 1: Project Details */}
                    {currentStep === "details" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Project Details</h2>
                                <p className="text-muted-foreground mb-6">
                                    Basic information about your project
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Project Name */}
                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-sm font-medium">
                                        Project Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        placeholder="e.g. Mobile App Redesign"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                    />
                                </div>

                                {/* Project Key */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Project Key <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        placeholder="e.g. MAR"
                                        value={projectKey}
                                        onChange={(e) => setProjectKey(e.target.value.toUpperCase())}
                                        maxLength={10}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        A short identifier for your project (2-10 characters)
                                    </p>
                                </div>

                                {/* Template */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Template</Label>
                                    <Select defaultValue="blank">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="blank">Blank Project</SelectItem>
                                            <SelectItem value="scrum">Scrum</SelectItem>
                                            <SelectItem value="kanban">Kanban</SelectItem>
                                            <SelectItem value="bug-tracking">Bug Tracking</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-sm font-medium">Description</Label>
                                    <Textarea
                                        // className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="What is this project about?"
                                        value={projectDescription}
                                        onChange={(e) => setProjectDescription(e.target.value)}
                                    />
                                </div>

                                {/* Start Date */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Start Date</Label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>

                                {/* End Date */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Target End Date</Label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Team Members */}
                    {currentStep === "members" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Team Access</h2>
                                <p className="text-muted-foreground mb-6">
                                    Select team members and set their access levels
                                </p>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                                <Input
                                    placeholder="Search members..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Selected Count */}
                            {projectMembers.length > 0 && (
                                <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                                    <CheckCircle2 className="size-5 text-primary" />
                                    <p className="text-sm">
                                        <span className="font-semibold">{projectMembers.length}</span> member
                                        {projectMembers.length !== 1 && "s"} selected
                                    </p>
                                </div>
                            )}

                            {/* Members List */}
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {filteredMembers.map((member) => {
                                    const projectMember = projectMembers.find(m => m.memberId === member.id)
                                    const isSelected = !!projectMember

                                    return (
                                        <Card
                                            key={member.id}
                                            className={`p-4 transition-all ${isSelected ? "border-primary bg-primary/5" : ""
                                                }`}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <Avatar className="size-10">
                                                        <AvatarImage src={member.avatar} />
                                                        <AvatarFallback>
                                                            {member.name.split(" ").map((n) => n[0]).join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="font-medium">{member.name}</p>
                                                        <p className="text-sm text-muted-foreground">{member.email}</p>
                                                    </div>
                                                    <Badge variant={member.role === "owner" ? "destructive" : member.role === "admin" ? "secondary" : "outline"} className="capitalize">
                                                        {member.role}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isSelected && (
                                                        <Select
                                                            value={projectMember.access}
                                                            onValueChange={(value: "view" | "edit" | "admin") =>
                                                                updateMemberAccess(member.id, value)
                                                            }
                                                        >
                                                            <SelectTrigger className="w-[120px]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="view">View</SelectItem>
                                                                <SelectItem value="edit">Edit</SelectItem>
                                                                <SelectItem value="admin">Admin</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                    <Button
                                                        variant={isSelected ? "destructive" : "default"}
                                                        size="sm"
                                                        onClick={() => toggleMember(member.id, "edit")}
                                                    >
                                                        {isSelected ? (
                                                            <>
                                                                <X className="size-4" />
                                                                Remove
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Plus className="size-4" />
                                                                Add
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Data Sources */}
                    {currentStep === "datasources" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Data Sources</h2>
                                <p className="text-muted-foreground mb-6">
                                    Connect data sources to import and track information
                                </p>
                            </div>

                            {/* Data Sources Grid */}
                            <div className="space-y-4">
                                {dataSources.map((source) => (
                                    <Card key={source.id} className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="p-2.5 rounded-lg bg-background border border-border">
                                                    {source.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-semibold">{source.name}</p>
                                                        <Badge variant="outline" className="text-xs">
                                                            {source.type}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-3">
                                                        {source.description}
                                                    </p>
                                                    {source.enabled && source.config && (
                                                        <div className="space-y-2">
                                                            {source.id === "github" ? (
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <Label className="text-xs font-medium">Select Repositories</Label>
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={loadGithubRepos}
                                                                            disabled={isLoadingGithubRepos}
                                                                        >
                                                                            {isLoadingGithubRepos ? (
                                                                                <>
                                                                                    <Loader2 className="size-4 mr-2 animate-spin" />
                                                                                    Loading
                                                                                </>
                                                                            ) : (
                                                                                "Refresh"
                                                                            )}
                                                                        </Button>
                                                                    </div>

                                                                    <Input
                                                                        placeholder="Search repos…"
                                                                        value={githubRepoQuery}
                                                                        onChange={(e) => setGithubRepoQuery(e.target.value)}
                                                                        className="h-9"
                                                                    />

                                                                    {isLoadingGithubRepos ? (
                                                                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                                            <Loader2 className="size-3 animate-spin" />
                                                                            Fetching repositories…
                                                                        </div>
                                                                    ) : githubRepos.length === 0 ? (
                                                                        <div className="text-xs text-muted-foreground">
                                                                            No repositories loaded. Make sure GitHub is connected for this organization.
                                                                        </div>
                                                                    ) : (
                                                                        <div className="max-h-56 overflow-auto rounded-md border border-border">
                                                                            {filteredGithubRepos.map((repo) => {
                                                                                const fullName = repo.full_name || repo.name
                                                                                const selected = selectedGithubRepos.includes(fullName)
                                                                                return (
                                                                                    <button
                                                                                        key={repo.id}
                                                                                        type="button"
                                                                                        onClick={() => toggleGithubRepo(fullName)}
                                                                                        className={`w-full flex items-start justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-muted/50 ${
                                                                                            selected ? "bg-primary/10" : ""
                                                                                        }`}
                                                                                    >
                                                                                        <div className="min-w-0">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <span className="font-medium truncate">{fullName}</span>
                                                                                                {repo.private && (
                                                                                                    <Badge variant="secondary" className="text-[10px]">Private</Badge>
                                                                                                )}
                                                                                            </div>
                                                                                            {repo.description && (
                                                                                                <div className="text-xs text-muted-foreground truncate">{repo.description}</div>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="shrink-0">
                                                                                            <Badge variant={selected ? "default" : "outline"} className="text-[10px]">
                                                                                                {selected ? "Selected" : "Select"}
                                                                                            </Badge>
                                                                                        </div>
                                                                                    </button>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                    )}

                                                                    {selectedGithubRepos.length > 0 && (
                                                                        <div className="text-xs text-muted-foreground">
                                                                            Selected: <span className="font-medium">{selectedGithubRepos.length}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : source.config.repositories ? (
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs font-medium">Select Repositories</Label>
                                                                    <Select defaultValue={source.config.repositories[0]}>
                                                                        <SelectTrigger className="h-8 text-xs">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {source.config.repositories.map((repo) => (
                                                                                <SelectItem key={repo} value={repo}>{repo}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            ) : null}
                                                            {source.config.channels && (
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs font-medium">Select Channels</Label>
                                                                    <Select defaultValue={source.config.channels[0]}>
                                                                        <SelectTrigger className="h-8 text-xs">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {source.config.channels.map((channel) => (
                                                                                <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            )}
                                                            {source.config.boards && (
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs font-medium">Select Boards</Label>
                                                                    <Select defaultValue={source.config.boards[0]}>
                                                                        <SelectTrigger className="h-8 text-xs">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {source.config.boards.map((board) => (
                                                                                <SelectItem key={board} value={board}>{board}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Switch
                                                checked={source.enabled}
                                                onCheckedChange={() => toggleDataSource(source.id)}
                                            />
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {dataSources.filter(ds => ds.enabled).length > 0 && (
                                <div className="flex items-center gap-2 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                                    <CheckCircle2 className="size-5 text-primary" />
                                    <p className="text-sm">
                                        <span className="font-semibold">{dataSources.filter(ds => ds.enabled).length}</span> data source
                                        {dataSources.filter(ds => ds.enabled).length !== 1 && "s"} enabled
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Settings */}
                    {currentStep === "settings" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Project Settings</h2>
                                <p className="text-muted-foreground mb-6">
                                    Configure additional project preferences
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* Visibility */}
                                <Card className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="font-medium mb-1">Project Visibility</p>
                                            <p className="text-sm text-muted-foreground">
                                                Control who can see this project
                                            </p>
                                        </div>
                                        <Select value={visibility} onValueChange={(value: "public" | "private") => setVisibility(value)}>
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="public">Public</SelectItem>
                                                <SelectItem value="private">Private</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </Card>

                                {/* Auto Sync */}
                                <Card className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="font-medium mb-1">Auto-sync Data</p>
                                            <p className="text-sm text-muted-foreground">
                                                Automatically sync data from connected sources every hour
                                            </p>
                                        </div>
                                        <Switch
                                            checked={autoSync}
                                            onCheckedChange={setAutoSync}
                                        />
                                    </div>
                                </Card>

                                {/* Notifications */}
                                <Card className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="font-medium mb-1">Email Notifications</p>
                                            <p className="text-sm text-muted-foreground">
                                                Receive email updates about project activity
                                            </p>
                                        </div>
                                        <Switch
                                            checked={notifications}
                                            onCheckedChange={setNotifications}
                                        />
                                    </div>
                                </Card>

                                {/* Summary */}
                                <Card className="p-5 bg-muted/50">
                                    <h3 className="font-semibold mb-4">Project Summary</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Project Name</span>
                                            <span className="text-sm font-medium">{projectName || "—"}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Project Key</span>
                                            <span className="text-sm font-medium">{projectKey || "—"}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Team Members</span>
                                            <span className="text-sm font-medium">{projectMembers.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Data Sources</span>
                                            <span className="text-sm font-medium">{dataSources.filter(ds => ds.enabled).length}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Visibility</span>
                                            <Badge variant="outline" className="capitalize">{visibility}</Badge>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={currentStep === "details"}
                        >
                            <ArrowLeft className="size-4" />
                            Back
                        </Button>
                        <div className="flex items-center gap-3">
                            {currentStep !== "settings" ? (
                                <Button onClick={handleNext} disabled={!canProceed()}>
                                    Next
                                    <ArrowRight className="size-4" />
                                </Button>
                            ) : (
                                <Button onClick={handleCreate} disabled={!canProceed()}>
                                    <Check className="size-4" />
                                    Create Project
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}