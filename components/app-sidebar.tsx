"use client"

import * as React from "react"
import {
    LayoutDashboard,
    Building2,
    FolderKanban,
    GitBranch,
    Users,
    Sparkles,
    MessageSquare,
    BarChart3,
    CalendarDays,
    ListChecks,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import { OrganizationSwitcher } from "./organization-switcher"
import { useAuthStore } from "@/store/auth.store"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

    const { user } = useAuthStore(state => state.auth);

    if (!user) {
        return (
            <div>Loading...</div>
        )
    }

    const data = {
        user: {
            name: `${user.firstName} ${user.lastName}` || "John Doe",
            email: user.email || "example@gmail.com",
            avatar: user.avatarUrl || undefined,
        },
        organizations: [
            {
                name: "Acme Inc",
                logo: Building2,
                plan: "Enterprise",
            },
            {
                name: "Acme Corp.",
                logo: Building2,
                plan: "Startup",
            },
        ],
        navMain: [
            {
                title: "Dashboard",
                url: "/dashboard",
                icon: LayoutDashboard,
                isActive: true,
                items: [
                    {
                        title: "Overview",
                        url: "/dashboard",
                    },
                ],
            },
            {
                title: "Organizations",
                url: "/dashboard/organizations",
                icon: Users,
                items: [
                    {
                        title: "All Organizations",
                        url: "/dashboard/organizations",
                    },
                    {
                        title: "New Organization",
                        url: "/dashboard/organizations/new",
                    },
                ],
            },
            {
                title: "Projects",
                url: "/dashboard/projects",
                icon: FolderKanban,
                items: [
                    {
                        title: "All Projects",
                        url: "/dashboard/projects",
                    },
                    {
                        title: "New Project",
                        url: "/dashboard/projects/new",
                    },
                ],
            },
            // {
            //     title: "Insights",
            //     url: "/dashboard/projects/[projectId]/insights",
            //     icon: BarChart3,
            //     items: [
            //         {
            //             title: "Analytics",
            //             url: "/dashboard/projects/[projectId]/insights",
            //         },
            //     ],
            // },
            // {
            //     title: "AI Assistant",
            //     url: "/dashboard/projects/[projectId]/chat",
            //     icon: Sparkles,
            //     items: [
            //         {
            //             title: "Project AI Chat",
            //             url: "/dashboard/projects/[projectId]/chat",
            //         },
            //     ],
            // },
            // {
            //     title: "Tasks",
            //     url: "/dashboard/projects/[projectId]/tasks",
            //     icon: ListChecks,
            //     items: [
            //         {
            //             title: "Task Board",
            //             url: "/dashboard/projects/[projectId]/tasks",
            //         },
            //     ],
            // },
            // {
            //     title: "Events",
            //     url: "/dashboard/projects/[projectId]/events",
            //     icon: CalendarDays,
            //     items: [
            //         {
            //             title: "Meetings & Events",
            //             url: "/dashboard/projects/[projectId]/events",
            //         },
            //     ],
            // },
            // {
            //     title: "Updates",
            //     url: "/dashboard/projects/[projectId]/analysis",
            //     icon: MessageSquare,
            //     items: [
            //         {
            //             title: "Data Source Analysis",
            //             url: "/dashboard/projects/[projectId]/analysis",
            //         },
            //     ],
            // },
            // {
            //     title: "Roadmap",
            //     url: "/dashboard/projects/[projectId]/page",
            //     icon: GitBranch,
            //     items: [
            //         {
            //             title: "Project Overview",
            //             url: "/dashboard/projects/[projectId]",
            //         },
            //     ],
            // },
        ],
        projects: [
            {
                name: "Project Alpha",
                url: "/dashboard/projects/alpha",
                icon: FolderKanban,
            },
            {
                name: "Project Beta",
                url: "/dashboard/projects/beta",
                icon: FolderKanban,
            },
            {
                name: "Project Gamma",
                url: "/dashboard/projects/gamma",
                icon: FolderKanban,
            },
        ],
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <OrganizationSwitcher organizations={data.organizations} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavProjects projects={data.projects} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}