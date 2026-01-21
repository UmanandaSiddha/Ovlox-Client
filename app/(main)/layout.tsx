import type { Metadata } from "next";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb";
import { ModeToggle } from "@/components/mode-toggle";
import Protected from "@/components/auth/protected";
import Image from "next/image";
import { OvloxLogo } from "@/assets";

export const metadata: Metadata = {
    title: "Dashboard | Ovlox",
    description: "Created by Siddha",
};

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Protected>
            <SidebarProvider>
                <AppSidebar />
                <main className="flex-1 min-h-0">
                    <header className="sticky top-0 z-40 bg-secondary flex w-full h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                            <DashboardBreadcrumb />
                        </div>
                        <div className="flex items-center gap-4 px-4">
                            <Image src={OvloxLogo} alt="Ovlox Logo" height={50} width={80} />
                            <ModeToggle />
                        </div>
                    </header>
                    {children}
                </main>
            </SidebarProvider>
        </Protected>
    );
}
