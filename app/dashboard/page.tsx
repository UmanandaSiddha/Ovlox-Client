"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { List, Search, Plus, Grid2X2, Filter, MoreHorizontal, GitBranch, Activity, Settings2, FileText, Copy, Link, CornerUpRight, Trash2, CornerUpLeft, LineChart, GalleryVerticalEnd, Trash, Bell, ArrowUp, ArrowDown, Github } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { SiDiscord, SiFigma, SiGithub, SiJira, SiSlack } from "react-icons/si"

type Project = {
    id: string
    name: string
    url?: string
    description?: string
}

const sampleProjects: Project[] = [
    { id: "1", name: "drokpa", url: "drokpa.vercel.app", description: "feat: added memory component and some UI" },
    { id: "2", name: "tic-tac-toe", url: "tic-tac-toe.vercel.app", description: "added type any → unknown fdas efadsrfa" },
    { id: "3", name: "umanandasiddha", url: "umanandasiddha.vercel.app", description: "new resume push das asdasdas sdfas" },
    { id: "4", name: "good-morning", url: "good-morning.vercel.app", description: "init histury rufus tero natedero yono" },
]

const data = [
    [
        {
            label: "Customize Page",
            icon: Settings2,
        },
        {
            label: "Turn into wiki",
            icon: FileText,
        },
    ],
    [
        {
            label: "Copy Link",
            icon: Link,
        },
        {
            label: "Duplicate",
            icon: Copy,
        },
        {
            label: "Move to",
            icon: CornerUpRight,
        },
        {
            label: "Move to Trash",
            icon: Trash2,
        },
    ],
    [
        {
            label: "Undo",
            icon: CornerUpLeft,
        },
        {
            label: "View analytics",
            icon: LineChart,
        },
        {
            label: "Version History",
            icon: GalleryVerticalEnd,
        },
        {
            label: "Show delete pages",
            icon: Trash,
        },
        {
            label: "Notifications",
            icon: Bell,
        },
    ],
    [
        {
            label: "Import",
            icon: ArrowUp,
        },
        {
            label: "Export",
            icon: ArrowDown,
        },
    ],
]

export default function Dashboard() {
    const [query, setQuery] = React.useState("")
    const [view, setView] = React.useState<"grid" | "list">("grid")

    const filtered = React.useMemo(() => {
        if (!query) return sampleProjects
        return sampleProjects.filter((p) =>
            `${p.name} ${p.description} ${p.url}`.toLowerCase().includes(query.toLowerCase())
        )
    }, [query])

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6">
                <div className="flex gap-2 items-center">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                            <Input
                                placeholder="Search Projects..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="rounded-md py-5 pl-10"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant={"outline"} className="whitespace-nowrap p-5" size="sm">
                            <Filter className="size-4" />
                        </Button>
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="inline-flex items-center rounded-md bg-card border border-border p-1">
                                <Button
                                    variant={view === "list" ? "default" : "ghost"}
                                    size="icon-sm"
                                    onClick={() => setView("list")}
                                    aria-pressed={view === "list"}
                                >
                                    <List className="size-4" />
                                </Button>
                                <Button
                                    variant={view === "grid" ? "default" : "ghost"}
                                    size="icon-sm"
                                    onClick={() => setView("grid")}
                                    aria-pressed={view === "grid"}
                                    className="-ml-px"
                                >
                                    <Grid2X2 className="size-4" />
                                </Button>
                            </div>
                        </div>

                        <Button className="whitespace-nowrap p-5" size="sm">
                            <Plus className="size-4" />
                            New Project
                        </Button>
                    </div>
                </div>
            </div>

            <div>
                {view === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((p) => (
                            <article key={p.id} className="border border-border rounded-md p-4 bg-card shadow-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={p.url} alt={p.name} />
                                            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-medium">{p.name}</span>
                                            {p.url && (
                                                <a href={p.url} target="blank" className="truncate text-xs hover:underline">{p.url}</a>
                                            )}
                                        </div>
                                    </div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="data-[state=open]:bg-accent h-7 w-7"
                                            >
                                                <MoreHorizontal className="size-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-56 overflow-hidden rounded-lg p-0"
                                            align="end"
                                        >
                                            <Sidebar collapsible="none" className="bg-transparent">
                                                <SidebarContent>
                                                    {data.map((group, index) => (
                                                        <SidebarGroup key={index} className="border-b last:border-none">
                                                            <SidebarGroupContent className="gap-0">
                                                                <SidebarMenu>
                                                                    {group.map((item, index) => (
                                                                        <SidebarMenuItem key={index}>
                                                                            <SidebarMenuButton>
                                                                                <item.icon /> <span>{item.label}</span>
                                                                            </SidebarMenuButton>
                                                                        </SidebarMenuItem>
                                                                    ))}
                                                                </SidebarMenu>
                                                            </SidebarGroupContent>
                                                        </SidebarGroup>
                                                    ))}
                                                </SidebarContent>
                                            </Sidebar>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                                <div className="mt-4 flex items-start gap-3 min-w-0">
                                    <SiGithub className="size-5" />
                                    <SiSlack className="size-5" />
                                    <SiDiscord className="size-5" />
                                    <SiJira className="size-5" />
                                    <SiFigma className="size-5" />
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filtered.map((p) => (
                            <div key={p.id} className="border border-border rounded-md p-4 bg-card w-full">
                                <div className="grid grid-cols-[3rem_2fr_3fr_auto_auto] items-center gap-4 w-full">
                                    <div className="flex items-center">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={p.url} alt={p.name} />
                                            <AvatarFallback className="rounded-lg">{p.name.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex flex-col">
                                            <span className="truncate font-medium">{p.name}</span>
                                            {p.url && (
                                                <a href={p.url} target="_blank" rel="noreferrer" className="truncate text-xs hover:underline">{p.url}</a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-sm text-muted-foreground truncate">{p.description}</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <SiGithub className="size-5" />
                                        <SiSlack className="size-5" />
                                        <SiDiscord className="size-5" />
                                        <SiJira className="size-5" />
                                        <SiFigma className="size-5" />
                                    </div>

                                    <div className="flex items-center justify-end">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="data-[state=open]:bg-accent h-7 w-7"
                                                >
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-56 overflow-hidden rounded-lg p-0"
                                                align="end"
                                            >
                                                <Sidebar collapsible="none" className="bg-transparent">
                                                    <SidebarContent>
                                                        {data.map((group, index) => (
                                                            <SidebarGroup key={index} className="border-b last:border-none">
                                                                <SidebarGroupContent className="gap-0">
                                                                    <SidebarMenu>
                                                                        {group.map((item, index) => (
                                                                            <SidebarMenuItem key={index}>
                                                                                <SidebarMenuButton>
                                                                                    <item.icon /> <span>{item.label}</span>
                                                                                </SidebarMenuButton>
                                                                            </SidebarMenuItem>
                                                                        ))}
                                                                    </SidebarMenu>
                                                                </SidebarGroupContent>
                                                            </SidebarGroup>
                                                        ))}
                                                    </SidebarContent>
                                                </Sidebar>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}