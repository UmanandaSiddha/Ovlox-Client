"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    CheckCircle2,
    XCircle,
    Loader2,
    Plug,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { userOrgBySlug } from "@/services/org.service"
import { getGithubInstallUrl, getGithubOAuthUrl, autoConnectGithubIntegration } from "@/services/github.service"
import { getSlackInstallUrl } from "@/services/slack.service"
import { getDiscordInstallUrl } from "@/services/discord.service"
import { getJiraInstallUrl } from "@/services/jira.service"
import { listIntegrations, subscribeToIntegrationStatus } from "@/services/integration.service"
import { IOrganization } from "@/types/prisma-generated"
import { ExternalProvider, IntegrationStatus } from "@/types/enum"
import { appIconMap } from "@/lib/app.icons"
import { toast } from "sonner"
import { useOrg } from "@/hooks/useOrg"
import type { OrgIntegrationStatusItem } from "@/types/api-types"

const AVAILABLE_INTEGRATIONS = [
    {
        provider: ExternalProvider.GITHUB,
        name: "GitHub",
        description: "Connect repositories and track commits, pull requests, and issues",
    },
    {
        provider: ExternalProvider.SLACK,
        name: "Slack",
        description: "Send notifications and sync messages from Slack channels",
    },
    {
        provider: ExternalProvider.DISCORD,
        name: "Discord",
        description: "Connect with Discord servers and sync channel messages",
    },
    {
        provider: ExternalProvider.JIRA,
        name: "Jira",
        description: "Sync issues and track progress from Jira projects",
    },
]

export default function Integrations() {
    const params = useParams()
    const router = useRouter()
    const { slug } = params
    const { loadOrgBySlug, currentOrg } = useOrg()

    const [organization, setOrganization] = React.useState<IOrganization | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [connecting, setConnecting] = React.useState<Record<string, boolean>>({})
    const [statusItems, setStatusItems] = React.useState<OrgIntegrationStatusItem[]>([])
    const [githubStep, setGithubStep] = React.useState<"oauth" | "install" | "done">("oauth")
    const [isStatusLoading, setIsStatusLoading] = React.useState(true)
    const [githubAvatarUrl, setGithubAvatarUrl] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (slug) {
            // prevent stale flash when switching orgs
            setIsLoading(true)
            setIsStatusLoading(true)
            setStatusItems([])
            setGithubStep("oauth")
            setGithubAvatarUrl(null)
            loadOrganization()
        }
    }, [slug])

    React.useEffect(() => {
        if (currentOrg?.slug) {
            loadIntegrations()
            // Subscribe to integration status updates
            const unsubscribe = subscribeToIntegrationStatus(currentOrg.slug as string, (items) => {
                setStatusItems(items)
                setIsStatusLoading(false)
            })

            return () => {
                if (unsubscribe) unsubscribe()
            }
        }
    }, [currentOrg?.slug, currentOrg?.id])

    const statusByProvider = React.useMemo(() => {
        const map = new Map<ExternalProvider, OrgIntegrationStatusItem>()
        for (const item of statusItems) {
            map.set(item.app, item)
        }
        return map
    }, [statusItems])

    React.useEffect(() => {
        const gh = statusByProvider.get(ExternalProvider.GITHUB)
        if (!gh) return
        // Drive the step from SSE (authoritative)
        const nextStep: "oauth" | "install" | "done" =
            gh.status === IntegrationStatus.CONNECTED
                ? "done"
                : gh.oauthStatus === "CONNECTED"
                ? "install"
                : "oauth"
        if (nextStep !== githubStep) setGithubStep(nextStep)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusByProvider])

    // Fetch GitHub avatar from public GitHub API once OAuth is connected.
    React.useEffect(() => {
        const gh = statusByProvider.get(ExternalProvider.GITHUB)
        const username = gh?.oauthAccount?.identifier
        if (!username) return

        let cancelled = false
        const controller = new AbortController()

        const load = async () => {
            try {
                const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
                    signal: controller.signal,
                })
                if (!res.ok) return
                const json = (await res.json()) as { avatar_url?: string }
                if (!cancelled) setGithubAvatarUrl(json.avatar_url || null)
            } catch {
                // ignore
            }
        }

        load()
        return () => {
            cancelled = true
            controller.abort()
        }
    }, [statusByProvider])

    const loadOrganization = async () => {
        if (!slug) return
        try {
            const { organization } = await userOrgBySlug(slug as string)
            setOrganization(organization)
        } catch (error) {
            console.error("Failed to load organization", error)
            toast.error("Failed to load organization")
        }
    }

    const loadIntegrations = async () => {
        if (!currentOrg?.id) return
        setIsLoading(true)
        try {
            // listIntegrations now returns OrgIntegrationStatusItem[] directly
            // The actual IIntegration data comes from the SSE status updates
            // This function is kept for compatibility but integrations state
            // should primarily be populated from the SSE subscription
            await listIntegrations(currentOrg.id)
        } catch (error) {
            console.error("Failed to load integrations", error)
            toast.error("Failed to load integrations")
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusItem = (provider: ExternalProvider): OrgIntegrationStatusItem | undefined => {
        return statusByProvider.get(provider)
    }

    // GitHub has a two-step flow: OAuth -> App install.
    const handleGithubOAuth = async () => {
        if (!currentOrg?.id) return

        setConnecting(prev => ({ ...prev, [ExternalProvider.GITHUB]: true }))
        try {
            const { url } = await getGithubOAuthUrl(currentOrg.id)
            if (url) {
                window.open(url, "_blank", "noopener,noreferrer")
                toast.success("Redirecting to GitHub OAuth...")
                setGithubStep("install")
            }
        } catch (error: any) {
            console.error("Failed to start GitHub OAuth", error)
            toast.error(error?.response?.data?.message || "Failed to start GitHub OAuth")
        } finally {
            setConnecting(prev => ({ ...prev, [ExternalProvider.GITHUB]: false }))
        }
    }

    const handleGithubInstall = async () => {
        if (!currentOrg?.id) return

        setConnecting(prev => ({ ...prev, [ExternalProvider.GITHUB]: true }))
        try {
            // If auto-connect is possible, "install" button becomes "Connect another account"
            const status = statusByProviderEffective.get(ExternalProvider.GITHUB)
            const canForceReconnect = status?.canAutoConnect

            const { url } = canForceReconnect
                ? await getGithubOAuthUrl(currentOrg.id, true)
                : await getGithubInstallUrl(currentOrg.id)
            if (url) {
                window.open(url, "_blank", "noopener,noreferrer")
                toast.success(
                    canForceReconnect
                        ? "Redirecting to GitHub OAuth to connect another account..."
                        : "Redirecting to GitHub App installation..."
                )
                setGithubStep("done")
            }
        } catch (error: any) {
            console.error("Failed to start GitHub App installation", error)
            toast.error(error?.response?.data?.message || "Failed to start GitHub App installation")
        } finally {
            setConnecting(prev => ({ ...prev, [ExternalProvider.GITHUB]: false }))
        }
    }

    const handleGithubAutoConnect = async () => {
        if (!currentOrg?.id) return
        const status = statusByProviderEffective.get(ExternalProvider.GITHUB)
        const candidate = status?.autoConnectCandidates?.[0]
        if (!status?.canAutoConnect || !candidate?.orgId) {
            toast.error("Auto-connect is not available for this organization.")
            return
        }

        setConnecting(prev => ({ ...prev, [ExternalProvider.GITHUB]: true }))
        try {
            await autoConnectGithubIntegration(currentOrg.id, candidate.orgId)
            toast.success(`Auto-connected GitHub from "${candidate.orgName}".`)
        } catch (error: any) {
            console.error("Failed to auto-connect GitHub", error)
            toast.error(error?.response?.data?.message || "Failed to auto-connect GitHub")
        } finally {
            setConnecting(prev => ({ ...prev, [ExternalProvider.GITHUB]: false }))
        }
    }

    const handleConnect = async (provider: ExternalProvider) => {
        if (!currentOrg?.id) return

        setConnecting(prev => ({ ...prev, [provider]: true }))
        try {
            let installUrl: string

            switch (provider) {
                case ExternalProvider.SLACK: {
                    const item = getStatusItem(provider)
                    if (!item?.integrationId) {
                        toast.error("Integration not found. Please create it first.")
                        return
                    }
                    const slackResponse = await getSlackInstallUrl(currentOrg.id, item.integrationId)
                    installUrl = slackResponse.url
                    break
                }
                case ExternalProvider.DISCORD: {
                    const item = getStatusItem(provider)
                    if (!item?.integrationId) {
                        toast.error("Integration not found. Please create it first.")
                        return
                    }
                    const discordResponse = await getDiscordInstallUrl(currentOrg.id, item.integrationId)
                    installUrl = discordResponse.url
                    break
                }
                case ExternalProvider.JIRA: {
                    const item = getStatusItem(provider)
                    if (!item?.integrationId) {
                        toast.error("Integration not found. Please create it first.")
                        return
                    }
                    const jiraResponse = await getJiraInstallUrl(currentOrg.id, item.integrationId)
                    installUrl = jiraResponse.url
                    break
                }
                default:
                    toast.error("Integration not supported")
                    return
            }

            if (installUrl) {
                window.open(installUrl, "_blank", "noopener,noreferrer")
                toast.success(`Redirecting to ${provider} authorization...`)
            }
        } catch (error: any) {
            console.error(`Failed to connect ${provider}`, error)
            toast.error(error?.response?.data?.message || `Failed to connect ${provider}`)
        } finally {
            setConnecting(prev => ({ ...prev, [provider]: false }))
        }
    }

    const effectiveStatusItems = React.useMemo<OrgIntegrationStatusItem[]>(() => {
        // Status items come from SSE subscription
        return statusItems
    }, [statusItems])

    const statusByProviderEffective = React.useMemo(() => {
        const map = new Map<ExternalProvider, OrgIntegrationStatusItem>()
        for (const item of effectiveStatusItems) map.set(item.app, item)
        return map
    }, [effectiveStatusItems])

    const connectedIntegrations = React.useMemo(() => {
        return effectiveStatusItems.filter((i) => i.status === IntegrationStatus.CONNECTED)
    }, [effectiveStatusItems])

    const notConnectedIntegrations = React.useMemo(() => {
        return AVAILABLE_INTEGRATIONS.filter((ai) => {
            const item = statusByProviderEffective.get(ai.provider)
            return !item || item.status !== IntegrationStatus.CONNECTED
        })
    }, [statusByProviderEffective])

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-2">Integrations</h1>
                <p className="text-muted-foreground">Connect external services to enhance your organization workflow</p>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="connected">Connected ({connectedIntegrations.length})</TabsTrigger>
                    <TabsTrigger value="available">Available ({notConnectedIntegrations.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                    {(isLoading || isStatusLoading) && (
                        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="size-4 animate-spin" />
                            Loading integration status…
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(isLoading && effectiveStatusItems.length === 0) ? (
                            Array.from({ length: 4 }).map((_, idx) => (
                                <Card key={idx} className="p-6 flex flex-col gap-4 animate-pulse">
                                    <div className="h-6 w-2/3 bg-muted rounded" />
                                    <div className="h-4 w-full bg-muted rounded" />
                                    <div className="h-10 w-full bg-muted rounded" />
                                </Card>
                            ))
                        ) : AVAILABLE_INTEGRATIONS.map((ai) => {
                            const status = statusByProviderEffective.get(ai.provider)
                            const Icon = appIconMap[ai.provider]
                            const isConnected = status?.status === IntegrationStatus.CONNECTED
                            const isConnecting = connecting[ai.provider]

                            return (
                                <Card key={ai.provider} className="p-6 flex flex-col gap-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            {Icon && <Icon className="size-8" />}
                                            <div>
                                                <h3 className="font-semibold">{ai.name}</h3>
                                                <p className="text-sm text-muted-foreground">{ai.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-top space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Badge variant={isConnected ? "default" : "secondary"}>
                                                {isConnected ? (
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle2 className="size-3" />
                                                        Connected
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <XCircle className="size-3" />
                                                        {status?.statusMessage ||
                                                            (ai.provider === ExternalProvider.GITHUB
                                                                ? githubStep === "oauth"
                                                                    ? "Step 1: OAuth required"
                                                                    : githubStep === "install"
                                                                        ? "Step 2: Install app"
                                                                        : "Connected"
                                                                : "Not Connected")}
                                                    </span>
                                                )}
                                            </Badge>
                                        </div>

                                        {/* Details (show if available) */}
                                        {ai.provider === ExternalProvider.GITHUB && status?.oauthStatus === "CONNECTED" && status.oauthAccount?.identifier && (
                                            <div className="flex items-center gap-3 rounded-lg border border-border p-3 bg-muted/30">
                                                <Avatar className="h-9 w-9">
                                                    {githubAvatarUrl ? (
                                                        <AvatarImage src={githubAvatarUrl} alt={status.oauthAccount.identifier} />
                                                    ) : (
                                                        <AvatarFallback>
                                                            {status.oauthAccount.identifier.slice(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    )}
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">{status.oauthAccount.identifier}</p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        OAuth connected{status.oauthConnectedAt ? ` • ${new Date(status.oauthConnectedAt).toLocaleString()}` : ""}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* GitHub auto-connect suggestion (reuse an existing installation) */}
                                        {ai.provider === ExternalProvider.GITHUB &&
                                            !!status?.canAutoConnect &&
                                            Array.isArray(status.autoConnectCandidates) &&
                                            status.autoConnectCandidates.length > 0 && (
                                            <div className="rounded-lg border border-dashed border-border p-3 bg-muted/20 space-y-2">
                                                <p className="text-xs text-muted-foreground">
                                                    We detected an existing GitHub App installation in{" "}
                                                    <span className="font-medium">
                                                        {status.autoConnectCandidates[0].orgName}
                                                    </span>
                                                    . You can auto-connect to reuse it, or connect a different account.
                                                </p>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={handleGithubAutoConnect}
                                                    disabled={isConnecting}
                                                >
                                                    {isConnecting ? (
                                                        <>
                                                            <Loader2 className="size-4 mr-2 animate-spin" />
                                                            Auto-connecting...
                                                        </>
                                                    ) : (
                                                        "Auto-connect existing installation"
                                                    )}
                                                </Button>
                                            </div>
                                        )}

                                        {ai.provider !== ExternalProvider.GITHUB && status?.externalAccount && (
                                            <div className="text-xs text-muted-foreground rounded-lg border border-border p-3 bg-muted/30">
                                                <div className="truncate"><span className="font-medium">Account:</span> {status.externalAccount}</div>
                                                {status.externalAccountId && (
                                                    <div className="truncate"><span className="font-medium">Account ID:</span> {status.externalAccountId}</div>
                                                )}
                                            </div>
                                        )}

                                        {ai.provider === ExternalProvider.GITHUB ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={handleGithubOAuth}
                                                    disabled={githubStep !== "oauth" || isConnecting}
                                                >
                                                    {isConnecting && githubStep === "oauth" ? (
                                                        <>
                                                            <Loader2 className="size-4 mr-2 animate-spin" />
                                                            Connecting...
                                                        </>
                                                    ) : (
                                                        "Connect OAuth"
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={handleGithubInstall}
                                                    disabled={githubStep !== "install" || isConnecting}
                                                >
                                                    {isConnecting && githubStep === "install" ? (
                                                        <>
                                                            <Loader2 className="size-4 mr-2 animate-spin" />
                                                            Installing...
                                                        </>
                                                    ) : (
                                                        status?.canAutoConnect ? "Connect another account" : "Install App"
                                                    )}
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleConnect(ai.provider)}
                                                    disabled={isConnecting}
                                                >
                                                    {isConnecting ? (
                                                        <>
                                                            <Loader2 className="size-4 mr-2 animate-spin" />
                                                            Connecting...
                                                        </>
                                                    ) : isConnected ? (
                                                        "Manage"
                                                    ) : (
                                                        <>
                                                            <Plug className="size-4 mr-2" />
                                                            Connect
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="connected">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {connectedIntegrations.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <Plug className="size-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No connected integrations</h3>
                                <p className="text-muted-foreground">Connect your first integration to get started</p>
                            </div>
                        ) : (
                            connectedIntegrations.map((integration) => {
                                const ai = AVAILABLE_INTEGRATIONS.find(a => a.provider === integration.app)
                                if (!ai) return null
                                const Icon = appIconMap[integration.app]
                                const isConnecting = connecting[integration.app]

                                return (
                                    <Card key={integration.integrationId} className="p-6 flex flex-col gap-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                {Icon && <Icon className="size-8" />}
                                                <div>
                                                    <h3 className="font-semibold">{ai.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{ai.description}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <Badge variant="default">
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle2 className="size-3" />
                                                    Connected
                                                </span>
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={isConnecting}
                                            >
                                                Manage
                                            </Button>
                                        </div>
                                    </Card>
                                )
                            })
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="available">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {notConnectedIntegrations.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <CheckCircle2 className="size-12 text-green-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">All integrations connected</h3>
                                <p className="text-muted-foreground">You've connected all available integrations</p>
                            </div>
                        ) : (
                            notConnectedIntegrations.map((ai) => {
                                const Icon = appIconMap[ai.provider]
                                const isConnecting = connecting[ai.provider]

                                return (
                                    <Card key={ai.provider} className="p-6 flex flex-col gap-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                {Icon && <Icon className="size-8" />}
                                                <div>
                                                    <h3 className="font-semibold">{ai.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{ai.description}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <Badge variant="secondary">
                                                <span className="flex items-center gap-1">
                                                    <XCircle className="size-3" />
                                                    Not Connected
                                                </span>
                                            </Badge>
                                            <Button
                                                size="sm"
                                                onClick={() => handleConnect(ai.provider)}
                                                disabled={isConnecting}
                                            >
                                                {isConnecting ? (
                                                    <>
                                                        <Loader2 className="size-4 mr-2 animate-spin" />
                                                        Connecting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plug className="size-4 mr-2" />
                                                        Connect
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </Card>
                                )
                            })
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
