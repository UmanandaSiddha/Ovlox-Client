"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    GitCommit,
    GitPullRequest,
    AlertTriangle,
    Shield,
    Code,
    Bug,
    ArrowLeft,
    X,
    ChevronRight,
} from "lucide-react"
import { SiGithub } from "react-icons/si"
import {
    CustomModal,
    CustomModalHeader,
    CustomModalTitle,
    CustomModalDescription,
    CustomModalClose,
    CustomModalBody,
    CustomModalFooter,
} from "@/components/ui/custom-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation"
import {
    getGithubCommits,
    getGithubCommitDetails,
    type GitHubCommitSummary,
    type GitHubCommitDetail,
} from "@/services/github.service"
import { llmMarkdownToHtml } from "@/lib/llm-format"
import { DiffViewer } from "@/components/diff-viewer"

type CommitSummary = GitHubCommitSummary

type CommitDetail = GitHubCommitDetail

const emptyPRs: any[] = []

const emptyIssues: any[] = []

export default function GitHubAnalysis() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const params = useParams()
    const projectId = params.projectId as string
    const [selectedCategory, setSelectedCategory] = React.useState<"commits" | "prs" | "issues">("commits")
    const [commits, setCommits] = React.useState<CommitSummary[]>([])
    const [commitDetail, setCommitDetail] = React.useState<CommitDetail | null>(null)
    const [selectedCommit, setSelectedCommit] = React.useState<CommitSummary | null>(null)
    const [isLoadingCommits, setIsLoadingCommits] = React.useState(true)
    const [isLoadingDetail, setIsLoadingDetail] = React.useState(false)
    const [showDiffModal, setShowDiffModal] = React.useState(false)
    const [showDebugModal, setShowDebugModal] = React.useState(false)
    const [summaryHtml, setSummaryHtml] = React.useState<string | null>(null);
    const [codeQualityHtml, setCodeQualityHtml] = React.useState<string | null>(null);

    React.useEffect(() => {
        const tab = searchParams.get("tab")
        if (tab === "commits" || tab === "prs" || tab === "issues") {
            setSelectedCategory(tab as any)
        } else {
            // default to commits for this page
            const params = new URLSearchParams(searchParams)
            params.set("tab", "commits")
            router.replace(`${pathname}?${params.toString()}`)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    React.useEffect(() => {
        const loadCommits = async () => {
            if (!projectId) return
            try {
                setIsLoadingCommits(true)
                const data = await getGithubCommits(projectId)
                setCommits(data)
            } catch (error) {
                console.error("Failed to load GitHub commits", error)
                setCommits([])
            } finally {
                setIsLoadingCommits(false)
            }
        }

        loadCommits()
    }, [projectId])

    const handleTabChange = (val: string) => {
        setSelectedCategory(val as any)
        setSelectedCommit(null)
        setCommitDetail(null)
        const params = new URLSearchParams(searchParams)
        params.set("tab", val)
        router.replace(`${pathname}?${params.toString()}`)
    }

    const handleSelectCommit = async (commit: CommitSummary) => {
        setSelectedCommit(commit)
        setCommitDetail(null)
        try {
            setIsLoadingDetail(true)
            const detail = await getGithubCommitDetails(projectId, commit.sha);
            setCommitDetail(detail);
            setSummaryHtml(await llmMarkdownToHtml(detail.aiSummary));
            setCodeQualityHtml(await llmMarkdownToHtml(detail.codeQuality));
        } catch (error) {
            console.error("Failed to load commit detail", error)
            setCommitDetail(null)
        } finally {
            setIsLoadingDetail(false)
        }
    }

    const getSecurityBadge = (level: string) => {
        const normalized = level.toLowerCase()
        switch (normalized) {
            case "none":
                return <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">No Risks</Badge>
            case "low":
                return <Badge variant="default" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Low Risk</Badge>
            case "medium":
                return <Badge variant="default" className="bg-orange-500/20 text-orange-400 border-orange-500/30">Medium Risk</Badge>
            case "high":
                return <Badge variant="default" className="bg-red-500/20 text-red-400 border-red-500/30">High Risk</Badge>
            default:
                return <Badge variant="secondary" className="border-border">{level}</Badge>
        }
    }

    const getQualityColor = (score: number) => {
        if (score >= 90) return "text-green-400"
        if (score >= 75) return "text-yellow-400"
        return "text-orange-400"
    }

    const renderCommitDetail = (detail: CommitDetail, summary: CommitSummary | null) => (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <GitCommit className="size-5 text-muted-foreground" />
                    <div>
                        <h3 className="font-semibold text-lg">{detail.commit.message}</h3>
                        <p className="text-sm text-muted-foreground">
                            {detail.commit.sha} • {new Date(detail.commit.date).toLocaleString()}
                        </p>
                    </div>
                </div>
                {summary && (
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">{summary.filesChanged} files</span>
                        <span className="text-green-400">+{summary.additions}</span>
                        <span className="text-red-400">-{summary.deletions}</span>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                    <Code className="size-4" />
                    AI Summary
                </h4>
                {summaryHtml && (
                    <div
                        className="prose prose-sm max-w-none text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: summaryHtml }}
                    />
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                        <CheckCircle2 className="size-4" />
                        Code Quality
                    </h4>
                    {codeQualityHtml && (
                        <div
                            className="prose prose-sm max-w-none text-sm text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: codeQualityHtml }}
                        />
                    )}
                </Card>

                <Card className="p-4">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                        <Shield className="size-4" />
                        Security
                    </h4>
                    <div className="mb-2">
                        {getSecurityBadge(detail.security.risk || "")}
                    </div>
                    {detail.security.notes?.length > 0 && (
                        <ul className="space-y-1 text-xs text-muted-foreground">
                            {detail.security.notes.map((note, idx) => (
                                <li key={idx} className="flex items-start gap-1">
                                    <AlertTriangle className="size-3 mt-0.5 shrink-0" />
                                    {note}
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>

            <div>
                <Button onClick={() => setShowDiffModal(true)} variant="outline" className="w-full">
                    <Code className="size-4 mr-2" />
                    View Code Changes ({detail.files.length} files)
                </Button>
            </div>
        </div>
    )
    const renderPRDetail = () => null

    const renderIssueDetail = () => null

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-linear-to-br from-gray-800 to-gray-900 border border-border">
                        <SiGithub className="size-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">GitHub Analysis</h1>
                        <p className="text-sm text-muted-foreground">
                            AI-powered insights for commits, pull requests, and issues
                        </p>
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={handleTabChange}>
                <TabsList className="grid w-full max-w-xl grid-cols-3">
                    <TabsTrigger value="commits" className="flex items-center gap-2">
                        <GitCommit className="size-4" />
                        <span>Commits</span>
                        <Badge variant="outline" className="ml-1 text-xs">{commits.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="prs" className="flex items-center gap-2">
                        <GitPullRequest className="size-4" />
                        <span>Pull Requests</span>
                        <Badge variant="outline" className="ml-1 text-xs">0</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="issues" className="flex items-center gap-2">
                        <AlertCircle className="size-4" />
                        <span>Issues</span>
                        <Badge variant="outline" className="ml-1 text-xs">0</Badge>
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-6">
                    {/* Commits */}
                    <TabsContent value="commits" className="mt-0 space-y-3">
                        {selectedCommit ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" size="sm" onClick={() => {
                                        setSelectedCommit(null)
                                        setCommitDetail(null)
                                    }}>
                                        <ArrowLeft className="size-4 mr-2" />
                                        Back
                                    </Button>
                                    <h2 className="text-xl font-semibold truncate">{selectedCommit.message}</h2>
                                </div>
                                <Card className="p-6 border-border/50 shadow-xl">
                                    {isLoadingDetail ? (
                                        <div className="space-y-3 animate-pulse">
                                            <div className="h-4 w-3/4 bg-muted rounded" />
                                            <div className="h-4 w-1/2 bg-muted rounded" />
                                            <div className="h-32 bg-muted rounded" />
                                        </div>
                                    ) : commitDetail ? (
                                        renderCommitDetail(commitDetail, selectedCommit)
                                    ) : null}
                                </Card>
                            </div>
                        ) : isLoadingCommits ? (
                            <Card className="p-6 text-sm text-muted-foreground flex items-center gap-2">
                                {/* <GitCommit className="size-4 animate-pulse" />
                                Loading commits... */}
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-4 w-3/4 bg-muted rounded" />
                                    <div className="h-4 w-1/2 bg-muted rounded" />
                                    <div className="h-32 bg-muted rounded" />
                                </div>
                            </Card>
                        ) : commits.length === 0 ? (
                            <Card className="p-6 text-sm text-muted-foreground flex items-center gap-2">
                                <GitCommit className="size-4" />
                                No commits found
                            </Card>
                        ) : (
                            commits.map((commit) => (
                                <Card
                                    key={commit.sha}
                                    className="p-4 cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                                    onClick={() => handleSelectCommit(commit)}
                                >
                                    <div className="flex items-start gap-3">
                                        <Avatar className="size-10 border-2 border-border">
                                            <AvatarFallback className="bg-linear-to-br from-purple-500 to-pink-500 text-white">
                                                {commit.author ? commit.author[0] : "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{commit.message}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {commit.author} • {commit.sha}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2 text-xs">
                                                <span className="text-muted-foreground">{commit.filesChanged} files</span>
                                                <span className="text-green-400">+{commit.additions}</span>
                                                <span className="text-red-400">-{commit.deletions}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    {/* PRs */}
                    <TabsContent value="prs" className="mt-0 space-y-3">
                        <Card className="p-6 text-sm text-muted-foreground flex items-center gap-2">
                            <GitPullRequest className="size-4" />
                            No pull requests found
                        </Card>
                    </TabsContent>

                    {/* Issues */}
                    <TabsContent value="issues" className="mt-0 space-y-3">
                        <Card className="p-6 text-sm text-muted-foreground flex items-center gap-2">
                            <AlertCircle className="size-4" />
                            No issues found
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>

            {/* Code Diff Modal */}
            <CustomModal open={showDiffModal} onOpenChange={setShowDiffModal} maxWidth="5xl">
                <CustomModalHeader>
                    <div className="flex-1">
                        <CustomModalTitle>Code Changes</CustomModalTitle>
                        <CustomModalDescription>
                            Review the code changes in this commit
                        </CustomModalDescription>
                    </div>
                    <CustomModalClose onClose={() => setShowDiffModal(false)} />
                </CustomModalHeader>
                <CustomModalBody className="max-h-[70vh]">
                    {commitDetail && commitDetail.files ? (
                        <div className="space-y-4">
                            {commitDetail.files.map((file, idx) => (
                                <div key={idx} className="border border-border rounded-lg overflow-hidden shadow-lg">
                                    <div className="bg-muted/50 px-4 py-3 font-mono text-sm font-medium border-b border-border flex items-center gap-2">
                                        <Code className="size-4 text-primary" />
                                        {file.filename}
                                    </div>
                                    <div className="bg-card/50">
                                        {/* {file.patch && (
                                            <pre className="px-4 py-2 text-xs font-mono overflow-x-auto whitespace-pre-wrap wrap-break-word">
                                                {file.patch}
                                            </pre>
                                        )} */}
                                        {file.patch && <DiffViewer patch={file.patch} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground">No code changes available</div>
                    )}
                </CustomModalBody>
                <CustomModalFooter>
                    <Button variant="outline" onClick={() => setShowDiffModal(false)}>
                        Close
                    </Button>
                </CustomModalFooter>
            </CustomModal>

            {/* Debug Code Modal */}
            <CustomModal open={showDebugModal} onOpenChange={setShowDebugModal} maxWidth="5xl">
                <CustomModalHeader>
                    <div className="flex-1">
                        <CustomModalTitle className="flex items-center gap-2">
                            <Bug className="size-5 text-primary" />
                            AI-Generated Debug Code
                        </CustomModalTitle>
                        <CustomModalDescription>
                            Review and commit the suggested fix
                        </CustomModalDescription>
                    </div>
                    <CustomModalClose onClose={() => setShowDebugModal(false)} />
                </CustomModalHeader>
                {/* <CustomModalBody className="max-h-[70vh]">
                    {selectedItem && "debugCode" in selectedItem && (
                        <div className="space-y-4">
                            <div className="bg-muted/30 p-6 rounded-lg border border-border shadow-inner">
                                <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
                                    {selectedItem.debugCode}
                                </pre>
                            </div>
                        </div>
                    )}
                </CustomModalBody> */}
                <CustomModalFooter>
                    <Button variant="outline" onClick={() => setShowDebugModal(false)}>
                        Cancel
                    </Button>
                    <Button className="bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600" onClick={() => {
                        // Handle commit logic here
                        alert("Code will be committed to GitHub")
                        setShowDebugModal(false)
                    }}>
                        <GitCommit className="size-4 mr-2" />
                        Commit Fix to GitHub
                    </Button>
                </CustomModalFooter>
            </CustomModal>
        </div>
    )
}
