"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
    Settings,
    Users,
    Building2,
    ArrowRight,
    CheckCircle2,
    XCircle,
    TrendingUp,
    Activity,
    Calendar,
    Plus,
    Github
} from "lucide-react"
import Link from "next/link"
import { userOrgBySlug } from "@/services/org.service"
import { getGithubInstallUrl } from "@/services/github.service"
import { useParams, useRouter } from "next/navigation"
import { IOrganization } from "@/types/prisma-generated"
import { ExternalProvider, IntegrationStatus, PredefinedOrgRole } from "@/types/enum"
import { appIconMap } from "@/lib/app.icons"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function Organization() {
    const params = useParams();
    const router = useRouter();
    const { slug } = params;

    const [organization, setOrganization] = React.useState<IOrganization | null>(null);
    const [showGithubSetupModal, setShowGithubSetupModal] = React.useState(false);
    const [isConnectingGithub, setIsConnectingGithub] = React.useState(false);

    React.useEffect(() => {
        if (slug) {
            const fetchOrgBySlug = async () => {
                const { organization }: { organization: IOrganization } = await userOrgBySlug(slug as string);
                setOrganization(organization);

                // Check if GitHub integration is connected
                const githubIntegration = organization?.integrations?.find(
                    (integration) => integration.type === ExternalProvider.GITHUB
                );

                const isGithubConnected = githubIntegration?.status === IntegrationStatus.CONNECTED;

                // Show setup modal if GitHub is not connected
                if (!isGithubConnected) {
                    setShowGithubSetupModal(true);
                }

                // const es = new EventSource(
                //     `http://localhost:4000/api/v1/orgs/integration/status/${slug as string}`,
                //     { withCredentials: true }
                // );
                // es.onmessage = (event) => {
                //     const payload = JSON.parse(event.data);
                //     console.log(payload.integrations);
                // };
                // es.onerror = (err) => {
                //     console.error('SSE error', err)
                //     es.close();
                // }
            }
            fetchOrgBySlug();
        }
    }, [slug]);

    const handleConnectGithub = async () => {
        if (!organization?.id) return;
        // Reuse the main integrations wizard for proper OAuth → App install flow
        router.push(`/organizations/${organization.slug}/integrations`);
    };

    if (!organization) {
        return (
            <div>
                no Org found
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                        <Avatar className="h-20 w-20 rounded-lg">
                            <AvatarImage src="" alt={organization.name} />
                            <AvatarFallback className="rounded-lg text-2xl font-bold bg-linear-to-br from-primary/20 to-primary/10">
                                {organization.name.split(" ").length > 1 ? `${organization.name.split(" ")?.[0][0]}${organization.name.split(" ")?.[1][0]}` : organization.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-bold">{organization.name}</h1>
                            <p className="text-muted-foreground mt-1">{"Building the future of software development"}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="default">Owner</Badge>
                                <span className="text-sm text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">{organization.members?.length || 0} member{(organization.members?.length || 0) > 1 ? "s" : ""}</span>
                                <span className="text-sm text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">{organization.projects?.length || 0} project{(organization.projects?.length || 0) > 1 ? "s" : ""}</span>
                            </div>
                        </div>
                    </div>
                    <Button>
                        <Settings className="size-4" />
                        Settings
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Total Projects</span>
                        <Building2 className="size-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold">{organization.projects?.length || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">{organization.projects?.length || 0} active</p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Team Members</span>
                        <Users className="size-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold">{organization.members?.length || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Across all projects</p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Deployments</span>
                        <TrendingUp className="size-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold">{organization.projects?.length || 0}</div>
                    <p className="text-xs text-green-600 mt-1">This week</p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Integrations</span>
                        <Activity className="size-4 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold">{organization.integrations?.filter(i => i.status === IntegrationStatus.CONNECTED).length || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Connected apps</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Project Metrics */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Project Activity</h2>
                            {(organization.projects?.length || 0) > 0 && (
                                <Button variant="outline" size="sm">View All</Button>
                            )}
                        </div>
                        {(organization.projects?.length || 0) > 0 ? (
                            <div className="space-y-4">
                                {organization.projects?.map((project) => (
                                    <div key={project.name} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium">{project.name}</h3>
                                                {/* <Badge variant={project.status === "active" ? "default" : "secondary"} className="text-xs">
                                                {project.status}
                                            </Badge> */}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Last deployed {project.description}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">{project.slug}</div>
                                            <p className="text-xs text-muted-foreground">deployments</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex justify-center items-center gap-2">
                                <p>No project yet?</p>
                                <Button onClick={() => router.push("/dashboard/projects/new")}>New Project</Button>
                            </div>
                        )}
                    </Card>

                    {/* Team Members */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Team Members</h2>
                            <Button variant="outline" size="sm">
                                <Plus className="size-4" />
                                Invite
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {organization.members?.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={member.user?.avatarUrl || undefined} alt={`${member.user?.firstName} ${member.user?.lastName}`} />
                                            <AvatarFallback>
                                                {`${member.user?.firstName?.[0]}${member.user?.lastName?.[0]}`}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{`${member.user?.firstName} ${member.user?.lastName}`}</p>
                                            <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                                        </div>
                                    </div>
                                    <Badge variant={member.predefinedRole === PredefinedOrgRole.OWNER ? "default" : member.predefinedRole === PredefinedOrgRole.ADMIN ? "secondary" : "outline"} className="capitalize">
                                        {member.predefinedRole}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right Column - 1/3 width */}
                <div className="space-y-6">
                    {/* Connected Apps */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Integrations</h2>
                            <Link href="/dashboard/integration">
                                <Button variant="ghost" size="sm">
                                    Manage
                                    <ArrowRight className="size-3 ml-1" />
                                </Button>
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {organization.integrations?.map((app) => {
                                const Icon = appIconMap[app.type];
                                return (
                                    <div key={app.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 flex items-center justify-center">
                                                {Icon && <Icon className="size-5" />}
                                            </div>
                                            <span className="font-medium text-sm capitalize">{app.type.toLowerCase()}</span>
                                        </div>
                                        {app.status === IntegrationStatus.CONNECTED ? (
                                            <CheckCircle2 className="size-4 text-green-600" />
                                        ) : (
                                            <XCircle className="size-4 text-muted-foreground" />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start" size="sm">
                                <Calendar className="size-4 mr-2" />
                                View Activity Log
                            </Button>
                            <Button variant="outline" className="w-full justify-start" size="sm">
                                <Building2 className="size-4 mr-2" />
                                Create New Project
                            </Button>
                            <Button variant="outline" className="w-full justify-start" size="sm">
                                <Users className="size-4 mr-2" />
                                Manage Roles
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* GitHub Setup Modal */}
            <Dialog open={showGithubSetupModal} onOpenChange={setShowGithubSetupModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Github className="size-5" />
                            Complete Organization Setup
                        </DialogTitle>
                        <DialogDescription>
                            Connect your GitHub account to unlock full features and integrate your repositories with this organization.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-muted/50">
                            <Github className="size-8 text-foreground" />
                            <div className="flex-1">
                                <p className="font-medium">GitHub Integration</p>
                                <p className="text-sm text-muted-foreground">
                                    Connect repositories, track commits, and manage deployments
                                </p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowGithubSetupModal(false)}
                            disabled={isConnectingGithub}
                        >
                            Skip for now
                        </Button>
                        <Button
                            onClick={handleConnectGithub}
                            disabled={isConnectingGithub}
                            className="w-full sm:w-auto"
                        >
                            <Github className="size-4 mr-2" />
                            {isConnectingGithub ? "Connecting..." : "Connect with GitHub"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}