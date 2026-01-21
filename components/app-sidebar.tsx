"use client"

import * as React from "react"
import {
    LayoutDashboard,
    GitBranch,
    Users,
    Sparkles,
    MessageSquare,
    BarChart3,
    CalendarDays,
    ListChecks,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { ProjectSwitcher } from "@/components/project-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import { OrganizationSwitcher } from "./organization-switcher"
import { useAuthStore } from "@/store/auth.store"
import { useProjectStore } from "@/store/project.store"
import { useOrgStore } from "@/store/org.store"
import { userOrgs } from "@/services/org.service"
import { listProjects } from "@/services/project.service"
import type { IOrganization, IProject } from "@/types/prisma-generated"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

    const { user } = useAuthStore(state => state.auth);
    const router = useRouter()
    const { currentProject, clearCurrentProject } = useProjectStore();
    const { currentOrg, setCurrentOrg } = useOrgStore();
    const [orgs, setOrgs] = React.useState<IOrganization[]>([])
    const [projects, setProjects] = React.useState<IProject[]>([])

    if (!user) {
        return (
            <div>Loading...</div>
        )
    }

    React.useEffect(() => {
        let cancelled = false
        const load = async () => {
            try {
                const res = await userOrgs()
                const items = res.data || []
                if (cancelled) return
                setOrgs(items)
                if (!currentOrg && items.length > 0) {
                    setCurrentOrg(items[0])
                }
            } catch (e) {
                console.error("Failed to load organizations", e)
            }
        }
        load()
        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id])

    React.useEffect(() => {
        let cancelled = false
        const load = async () => {
            if (!currentOrg?.id) {
                setProjects([])
                return
            }
            try {
                const res = await listProjects(currentOrg.id)
                if (cancelled) return
                setProjects(res.data || [])
            } catch (e) {
                console.error("Failed to load projects", e)
                setProjects([])
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [currentOrg?.id])

    // Base navigation items (always shown)
    const baseNavItems = [
        {
            title: "Dashboard",
            url: "/",
            icon: LayoutDashboard,
            isActive: true,
            items: [
                {
                    title: "Overview",
                    url: "/",
                },
            ],
        },
        {
            title: "Organizations",
            url: "/organizations",
            icon: Users,
            items: [
                {
                    title: "All Organizations",
                    url: "/organizations",
                },
                {
                    title: "New Organization",
                    url: "/organizations/new",
                },
            ],
        },
        {
            title: "Projects",
            url: "/projects",
            icon: GitBranch,
            items: [
                {
                    title: "All Projects",
                    url: "/projects",
                },
                {
                    title: "New Project",
                    url: "/projects/new",
                },
            ],
        },
    ];

    // Project-specific navigation items (shown when project is selected)
    const projectNavItems = currentProject ? [
        {
            title: "Project Overview",
            url: `/projects/${currentProject.id}`,
            icon: GitBranch,
            items: [
                {
                    title: "Overview",
                    url: `/projects/${currentProject.id}`,
                },
            ],
        },
        {
            title: "AI Assistant",
            url: `/projects/${currentProject.id}/chat`,
            icon: Sparkles,
            items: [
                {
                    title: "Project AI Chat",
                    url: `/projects/${currentProject.id}/chat`,
                },
            ],
        },
        {
            title: "Tasks",
            url: `/projects/${currentProject.id}/tasks`,
            icon: ListChecks,
            items: [
                {
                    title: "Task Board",
                    url: `/projects/${currentProject.id}/tasks`,
                },
            ],
        },
        {
            title: "Events",
            url: `/projects/${currentProject.id}/events`,
            icon: CalendarDays,
            items: [
                {
                    title: "Meetings & Events",
                    url: `/projects/${currentProject.id}/events`,
                },
            ],
        },
        {
            title: "Insights",
            url: `/projects/${currentProject.id}/insights`,
            icon: BarChart3,
            items: [
                {
                    title: "Analytics",
                    url: `/projects/${currentProject.id}/insights`,
                },
            ],
        },
        {
            title: "Analysis",
            url: `/projects/${currentProject.id}/analysis`,
            icon: MessageSquare,
            items: [
                {
                    title: "Data Source Analysis",
                    url: `/projects/${currentProject.id}/analysis`,
                },
            ],
        },
    ] : [];

    const data = {
        user: {
            name: `${user.firstName} ${user.lastName}` || "John Doe",
            email: user.email || "example@gmail.com",
            avatar: user.avatarUrl || undefined,
        },
        navMain: [...baseNavItems, ...projectNavItems],
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <OrganizationSwitcher
                    organizations={orgs}
                    onAddOrganization={() => router.push("/organizations/new")}
                />
                {/* Project switcher sits under org switcher and uses a distinct, compact style */}
                <div className="mt-2">
                    <ProjectSwitcher />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavProjects projects={projects} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}