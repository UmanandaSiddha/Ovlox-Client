"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, FolderKanban } from "lucide-react"
import { useRouter } from "next/navigation"
import { useProjectStore } from "@/store/project.store"
import { useOrgStore } from "@/store/org.store"
import { listProjects } from "@/services/project.service"
import { IProject } from "@/types/prisma-generated"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"

export function ProjectSwitcher() {
    const { isMobile } = useSidebar()
    const router = useRouter()
    const { currentProject, setCurrentProject } = useProjectStore()
    const { currentOrg } = useOrgStore()
    const [projects, setProjects] = React.useState<IProject[]>([])

    React.useEffect(() => {
        const fetchProjects = async () => {
            if (currentOrg?.id) {
                try {
                    const response = await listProjects(currentOrg.id)
                    setProjects(response.data || [])
                } catch (error) {
                    console.error("Failed to load projects", error)
                }
            } else {
                setProjects([])
            }
        }

        fetchProjects()
    }, [currentOrg?.id])

    const handleSelectProject = (project: IProject) => {
        setCurrentProject(project)
        router.push(`/projects/${project.id}`)
    }

    const handleNewProject = () => {
        router.push(`/projects/new`)
    }

    if (!currentOrg) {
        return null
    }

    const displayProject = currentProject || { name: "Select Project", slug: "" }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="sm"
                            className="data-[state=open]:bg-sidebar-accent/50 data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="bg-sidebar-accent text-sidebar-accent-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                                <FolderKanban className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{displayProject.name}</span>
                                <span className="truncate text-xs text-muted-foreground">Project</span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-muted-foreground text-xs">
                            Projects
                        </DropdownMenuLabel>
                        {projects.length === 0 ? (
                            <DropdownMenuItem disabled className="text-muted-foreground text-xs">
                                No projects available
                            </DropdownMenuItem>
                        ) : (
                            projects.map((project, index) => (
                                <DropdownMenuItem
                                    key={project.id}
                                    onClick={() => handleSelectProject(project)}
                                    className="gap-2 p-2"
                                >
                                    <div className="flex size-6 items-center justify-center rounded-md border">
                                        <FolderKanban className="size-3.5 shrink-0" />
                                    </div>
                                    {project.name}
                                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            ))
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 p-2" onClick={handleNewProject}>
                            <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                <Plus className="size-4" />
                            </div>
                            <div className="text-muted-foreground font-medium">New Project</div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
