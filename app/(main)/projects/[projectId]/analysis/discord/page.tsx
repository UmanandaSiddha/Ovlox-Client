"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
    MessageSquare,
    Hash,
    Users,
    Clock,
    ArrowLeft,
    TrendingUp,
} from "lucide-react"
import { SiDiscord } from "react-icons/si"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation"
import { getDiscordChannels } from "@/services/discord.service"
import type { DiscordChannel } from "@/types/api-types"
import { useOrg } from "@/hooks/useOrg"
import { useProject } from "@/hooks/useProject"

export default function DiscordAnalysis() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const params = useParams()
    const { projectId } = params
    const { currentOrg } = useOrg()
    const { loadProject, currentProject } = useProject()

    const [selectedCategory, setSelectedCategory] = React.useState<"channels" | "messages" | "activity">("channels")
    const [discordChannels, setDiscordChannels] = React.useState<DiscordChannel[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [selectedChannel, setSelectedChannel] = React.useState<DiscordChannel | null>(null)

    React.useEffect(() => {
        if (currentOrg?.id && projectId) {
            loadProject(currentOrg.id, projectId as string)
        }
    }, [currentOrg?.id, projectId])

    React.useEffect(() => {
        const tab = searchParams.get("tab")
        if (tab === "channels" || tab === "messages" || tab === "activity") {
            setSelectedCategory(tab as any)
        } else {
            const params = new URLSearchParams(searchParams)
            params.set("tab", "channels")
            router.replace(`${pathname}?${params.toString()}`)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    React.useEffect(() => {
        const loadDiscordChannels = async () => {
            // TODO: Get integration ID and guild ID from project integrations
            // For now, we'll show a placeholder
            setIsLoading(false)
            setDiscordChannels([])
        }

        loadDiscordChannels()
    }, [projectId])

    const handleTabChange = (val: string) => {
        setSelectedCategory(val as any)
        setSelectedChannel(null)
        const params = new URLSearchParams(searchParams)
        params.set("tab", val)
        router.replace(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-linear-to-br from-indigo-600 to-indigo-700 border border-border">
                        <SiDiscord className="size-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Discord Analysis</h1>
                        <p className="text-sm text-muted-foreground">
                            Monitor channels, messages, and community engagement
                        </p>
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={handleTabChange}>
                <TabsList className="grid w-full max-w-xl grid-cols-3">
                    <TabsTrigger value="channels" className="flex items-center gap-2">
                        <Hash className="size-4" />
                        <span>Channels</span>
                        <Badge variant="outline" className="ml-1 text-xs">{discordChannels.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="messages" className="flex items-center gap-2">
                        <MessageSquare className="size-4" />
                        <span>Messages</span>
                        <Badge variant="outline" className="ml-1 text-xs">0</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="flex items-center gap-2">
                        <TrendingUp className="size-4" />
                        <span>Activity</span>
                        <Badge variant="outline" className="ml-1 text-xs">0</Badge>
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-6">
                    {/* Channels */}
                    <TabsContent value="channels" className="mt-0 space-y-3">
                        {isLoading ? (
                            <Card className="p-6 text-sm text-muted-foreground flex items-center gap-2">
                                <div className="space-y-3 animate-pulse w-full">
                                    <div className="h-4 w-3/4 bg-muted rounded" />
                                    <div className="h-4 w-1/2 bg-muted rounded" />
                                    <div className="h-32 bg-muted rounded" />
                                </div>
                            </Card>
                        ) : discordChannels.length === 0 ? (
                            <Card className="p-12">
                                <div className="text-center">
                                    <SiDiscord className="size-12 text-muted-foreground mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold mb-2">No Discord Channels Found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Connect a Discord integration to start monitoring community communication
                                    </p>
                                    {currentOrg?.slug && (
                                        <Button onClick={() => router.push(`/organizations/${currentOrg.slug}/integrations`)}>
                                            <ArrowLeft className="size-4 mr-2" />
                                            Connect Discord Integration
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ) : (
                            discordChannels.map((channel) => (
                                <Card
                                    key={channel.id}
                                    className="p-4 cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                                    onClick={() => setSelectedChannel(channel)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950">
                                            <Hash className="size-5 text-indigo-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium">#{channel.name}</p>
                                                <Badge variant="secondary" className="text-xs">
                                                    Type {channel.type}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Guild ID: {channel.guild_id}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    {/* Messages */}
                    <TabsContent value="messages" className="mt-0 space-y-3">
                        <Card className="p-12">
                            <div className="text-center">
                                <MessageSquare className="size-12 text-muted-foreground mx-auto mb-3" />
                                <h3 className="text-lg font-semibold mb-2">No Messages Found</h3>
                                <p className="text-muted-foreground">
                                    Messages will appear here once data is ingested from your Discord channels
                                </p>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Activity */}
                    <TabsContent value="activity" className="mt-0 space-y-3">
                        <Card className="p-12">
                            <div className="text-center">
                                <TrendingUp className="size-12 text-muted-foreground mx-auto mb-3" />
                                <h3 className="text-lg font-semibold mb-2">No Activity Data</h3>
                                <p className="text-muted-foreground">
                                    Activity insights will appear here once your Discord integration is set up
                                </p>
                            </div>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
