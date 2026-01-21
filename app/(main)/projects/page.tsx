"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { List, Search, Plus, Grid2X2, Filter, MoreHorizontal, Settings2, FileText, Copy, Link, CornerUpRight, Trash2, CornerUpLeft, LineChart, GalleryVerticalEnd, Trash, Bell, ArrowUp, ArrowDown, Github } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { useOrg } from "@/hooks/useOrg"
import { listProjects } from "@/services/project.service"
import { IProject } from "@/types/prisma-generated"
import { appIconMap } from "@/lib/app.icons"
import { ExternalProvider } from "@/types/enum"
import { FolderKanban } from "lucide-react"

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

export default function Projects() {
    const router = useRouter()
    const { currentOrg } = useOrg()
    const [query, setQuery] = React.useState("")
    const [view, setView] = React.useState<"grid" | "list">("grid")
    const [projects, setProjects] = React.useState<IProject[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        if (currentOrg?.id) {
            fetchProjects()
        } else {
            setIsLoading(false)
        }
    }, [currentOrg?.id])

    const fetchProjects = async () => {
        if (!currentOrg?.id) return
        setIsLoading(true)
        try {
            const response = await listProjects(currentOrg.id, { search: query || undefined })
            setProjects(response.data || [])
        } catch (error) {
            console.error("Failed to load projects", error)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        if (currentOrg?.id) {
            const debounceTimer = setTimeout(() => {
                fetchProjects()
            }, 400)
            return () => clearTimeout(debounceTimer)
        }
    }, [query, currentOrg?.id])

    const filtered = React.useMemo(() => {
        if (!query) return projects
        return projects.filter((p) =>
            `${p.name} ${p.description || ""}`.toLowerCase().includes(query.toLowerCase())
        )
    }, [projects, query])

    const handleNewProject = () => {
        if (currentOrg?.slug) {
            router.push(`/projects/new`)
        } else {
            router.push("/projects/new")
        }
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Projects</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage and access your projects
                    </p>
                </div>
            </div>

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

                        <Button className="whitespace-nowrap p-5" size="sm" onClick={handleNewProject}>
                            <Plus className="size-4" />
                            New Project
                        </Button>
                    </div>
                </div>
            </div>

            <div>
                {isLoading ? (
                    <div className="text-center py-12">Loading projects...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12">
                        <FolderKanban className="size-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                        <p className="text-muted-foreground mb-4">
                            {query ? "Try adjusting your search" : "Get started by creating your first project"}
                        </p>
                        {!query && (
                            <Button onClick={handleNewProject}>
                                <Plus className="size-4 mr-2" />
                                Create Project
                            </Button>
                        )}
                    </div>
                ) : view === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((p) => {
                            const integrations = p.integrations || []
                            const integrationTypes = integrations.map(i => i.integration?.type).filter(Boolean) as ExternalProvider[]
                            
                            return (
                                <article 
                                    key={p.id} 
                                    className="border border-border rounded-md p-4 bg-card shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => {
                                        if (currentOrg?.slug) {
                                            router.push(`/projects/${p.id}`)
                                        } else {
                                            router.push(`/projects/${p.id}`)
                                        }
                                    }}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <Avatar className="h-8 w-8 rounded-lg">
                                                <AvatarFallback className="rounded-lg">{p.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="grid flex-1 text-left text-sm leading-tight">
                                                <span className="truncate font-medium">{p.name}</span>
                                                {p.slug && (
                                                    <span className="truncate text-xs text-muted-foreground">{p.slug}</span>
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
                                    <p className="mt-2 text-sm text-muted-foreground">{p.description || "No description"}</p>
                                    <div className="mt-4 flex items-start gap-2 min-w-0">
                                        {integrationTypes.map((type) => {
                                            const Icon = appIconMap[type]
                                            return Icon ? <Icon key={type} className="size-4" /> : null
                                        })}
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filtered.map((p) => {
                            const integrations = p.integrations || []
                            const integrationTypes = integrations.map(i => i.integration?.type).filter(Boolean) as ExternalProvider[]
                            
                            return (
                                <div 
                                    key={p.id} 
                                    className="border border-border rounded-md p-4 bg-card w-full hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => {
                                        if (currentOrg?.slug) {
                                            router.push(`/projects/${p.id}`)
                                        } else {
                                            router.push(`/projects/${p.id}`)
                                        }
                                    }}
                                >
                                    <div className="grid grid-cols-[3rem_2fr_3fr_auto_auto] items-center gap-4 w-full">
                                        <div className="flex items-center">
                                            <Avatar className="h-8 w-8 rounded-lg">
                                                <AvatarFallback className="rounded-lg">{p.name.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-col">
                                                <span className="truncate font-medium">{p.name}</span>
                                                {p.slug && (
                                                    <span className="truncate text-xs text-muted-foreground">{p.slug}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-sm text-muted-foreground truncate">{p.description || "No description"}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {integrationTypes.map((type) => {
                                                const Icon = appIconMap[type]
                                                return Icon ? <Icon key={type} className="size-4" /> : null
                                            })}
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
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}