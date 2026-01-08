"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

type AppItem = {
    id: string
    name: string
    description: string
    logo?: string
}

const APPS: AppItem[] = [
    { id: "github", name: "GitHub", description: "Connect your repositories and pull requests.", logo: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" },
    { id: "slack", name: "Slack", description: "Send notifications and alerts to your Slack workspace.", logo: "https://a.slack-edge.com/80588/marketing/img/meta/slack_hash_256.png" },
    { id: "figma", name: "Figma", description: "Preview designs and link commits to designs.", logo: "https://static.figma.com/app/icon/1/favicon.png" },
    { id: "discord", name: "Discord", description: "Push deployment notifications to a Discord channel.", logo: "https://cdn.worldvectorlogo.com/logos/discord-6.svg" },
    { id: "jira", name: "Jira", description: "Link issues and track deployments.", logo: "https://wac-cdn.atlassian.com/assets/img/favicons/atlassian/favicon.png" },
]

export default function AppIntegration() {
    const [connected, setConnected] = React.useState<Record<string, boolean>>(() => {
        // default: github and slack connected
        return APPS.reduce((acc, a) => ({ ...acc, [a.id]: a.id === "github" || a.id === "slack" }), {} as Record<string, boolean>)
    })

    function toggle(id: string) {
        setConnected((s) => ({ ...s, [id]: !s[id] }))
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-semibold mb-4">Integrations</h1>

            <Tabs defaultValue="all">
                <TabsList className="mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="connected">Connected</TabsTrigger>
                    <TabsTrigger value="disconnected">Non-connected</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {APPS.map((app) => (
                            <div key={app.id} className="border border-border rounded-md p-4 bg-card flex flex-col gap-3">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            {app.logo ? <AvatarImage src={app.logo} alt={app.name} /> : <AvatarFallback>{app.name.charAt(0)}</AvatarFallback>}
                                        </Avatar>
                                        <div>
                                            <div className="text-sm font-medium">{app.name}</div>
                                            <div className="text-xs text-muted-foreground">{app.description}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Switch checked={!!connected[app.id]} onCheckedChange={() => toggle(app.id)} />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">Manage</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="connected">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {APPS.filter((a) => connected[a.id]).map((app) => (
                            <div key={app.id} className="border border-border rounded-md p-4 bg-card flex flex-col gap-3">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            {app.logo ? <AvatarImage src={app.logo} alt={app.name} /> : <AvatarFallback>{app.name.charAt(0)}</AvatarFallback>}
                                        </Avatar>
                                        <div>
                                            <div className="text-sm font-medium">{app.name}</div>
                                            <div className="text-xs text-muted-foreground">{app.description}</div>
                                        </div>
                                    </div>

                                    <Switch checked={!!connected[app.id]} onCheckedChange={() => toggle(app.id)} />
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="disconnected">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {APPS.filter((a) => !connected[a.id]).map((app) => (
                            <div key={app.id} className="border border-border rounded-md p-4 bg-card flex flex-col gap-3">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            {app.logo ? <AvatarImage src={app.logo} alt={app.name} /> : <AvatarFallback>{app.name.charAt(0)}</AvatarFallback>}
                                        </Avatar>
                                        <div>
                                            <div className="text-sm font-medium">{app.name}</div>
                                            <div className="text-xs text-muted-foreground">{app.description}</div>
                                        </div>
                                    </div>

                                    <Switch checked={!!connected[app.id]} onCheckedChange={() => toggle(app.id)} />
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}