"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
    Building2,
    Users,
    Zap,
    ArrowRight,
    ArrowLeft,
    Check,
    X,
    Mail,
    Plus,
    Trash2,
    Upload,
    CheckCircle2
} from "lucide-react"
import { SiGithub, SiSlack, SiDiscord, SiJira, SiFigma, SiNotion } from "react-icons/si"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

type Step = "details" | "members" | "integrations"

type InviteMember = {
    id: string
    email: string
    role: "admin" | "member"
}

type Integration = {
    id: string
    name: string
    description: string
    icon: React.ReactNode
    connected: boolean
}

const availableIntegrations: Integration[] = [
    {
        id: "github",
        name: "GitHub",
        description: "Connect repositories and track commits",
        icon: <SiGithub className="size-6" />,
        connected: false,
    },
    {
        id: "slack",
        name: "Slack",
        description: "Send notifications to channels",
        icon: <SiSlack className="size-6" />,
        connected: false,
    },
    {
        id: "discord",
        name: "Discord",
        description: "Connect with Discord servers",
        icon: <SiDiscord className="size-6" />,
        connected: false,
    },
    {
        id: "jira",
        name: "Jira",
        description: "Sync issues and track progress",
        icon: <SiJira className="size-6" />,
        connected: false,
    },
    {
        id: "figma",
        name: "Figma",
        description: "Link design files and prototypes",
        icon: <SiFigma className="size-6" />,
        connected: false,
    },
    {
        id: "notion",
        name: "Notion",
        description: "Connect workspaces and pages",
        icon: <SiNotion className="size-6" />,
        connected: false,
    },
]

export default function NewOrganization() {
    const [currentStep, setCurrentStep] = React.useState<Step>("details")
    const [orgName, setOrgName] = React.useState("")
    const [orgDescription, setOrgDescription] = React.useState("")
    const [orgWebsite, setOrgWebsite] = React.useState("")
    const [members, setMembers] = React.useState<InviteMember[]>([])
    const [newEmail, setNewEmail] = React.useState("")
    const [newRole, setNewRole] = React.useState<"admin" | "member">("member")
    const [selectedIntegrations, setSelectedIntegrations] = React.useState<string[]>([])

    const steps = [
        { id: "details", label: "Organization Details", icon: Building2 },
        { id: "members", label: "Invite Members", icon: Users },
        { id: "integrations", label: "Connect Apps", icon: Zap },
    ]

    const addMember = () => {
        if (newEmail && !members.find(m => m.email === newEmail)) {
            setMembers([...members, {
                id: Date.now().toString(),
                email: newEmail,
                role: newRole,
            }])
            setNewEmail("")
            setNewRole("member")
        }
    }

    const removeMember = (id: string) => {
        setMembers(members.filter(m => m.id !== id))
    }

    const toggleIntegration = (id: string) => {
        setSelectedIntegrations(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const canProceed = () => {
        if (currentStep === "details") {
            return orgName.trim().length > 0
        }
        return true
    }

    const handleNext = () => {
        if (currentStep === "details") setCurrentStep("members")
        else if (currentStep === "members") setCurrentStep("integrations")
    }

    const handleBack = () => {
        if (currentStep === "integrations") setCurrentStep("members")
        else if (currentStep === "members") setCurrentStep("details")
    }

    const handleCreate = () => {
        console.log("Creating organization:", {
            name: orgName,
            description: orgDescription,
            website: orgWebsite,
            members,
            integrations: selectedIntegrations,
        })
    }

    const getStepIndex = (step: Step) => steps.findIndex(s => s.id === step)
    const currentStepIndex = getStepIndex(currentStep)

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-2">Create New Organization</h1>
                    <p className="text-muted-foreground">Set up your organization in a few simple steps</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const StepIcon = step.icon
                            const isActive = currentStep === step.id
                            const isCompleted = getStepIndex(step.id as Step) < currentStepIndex

                            return (
                                <React.Fragment key={step.id}>
                                    <div className="flex flex-col items-center gap-2">
                                        <div
                                            className={`flex items-center justify-center size-12 rounded-full border-2 transition-colors ${isCompleted
                                                ? "bg-primary border-primary text-primary-foreground"
                                                : isActive
                                                    ? "bg-primary/10 border-primary text-primary"
                                                    : "bg-background border-border text-muted-foreground"
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <Check className="size-6" />
                                            ) : (
                                                <StepIcon className="size-6" />
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                                                {step.label}
                                            </p>
                                        </div>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`flex-1 h-0.5 mx-4 transition-colors ${getStepIndex(step.id as Step) < currentStepIndex
                                                ? "bg-primary"
                                                : "bg-border"
                                                }`}
                                        />
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </div>
                </div>

                {/* Form Content */}
                <Card className="p-8">
                    {/* Step 1: Organization Details */}
                    {currentStep === "details" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Organization Details</h2>
                                <p className="text-muted-foreground mb-6">
                                    Tell us about your organization
                                </p>
                            </div>

                            {/* Organization Logo */}
                            <div className="flex items-center gap-6">
                                <Avatar className="size-24">
                                    <AvatarFallback className="text-2xl">
                                        {orgName.charAt(0).toUpperCase() || "O"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <Button variant="outline" size="sm">
                                        <Upload className="size-4" />
                                        Upload Logo
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        JPG, PNG or SVG. Max size 2MB.
                                    </p>
                                </div>
                            </div>

                            {/* Organization Name */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Organization Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    placeholder="e.g. Acme Inc."
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Description</Label>
                                <Textarea
                                    // className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="What does your organization do?"
                                    value={orgDescription}
                                    onChange={(e) => setOrgDescription(e.target.value)}
                                />
                            </div>

                            {/* Website */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Website</Label>
                                <Input
                                    type="url"
                                    placeholder="https://example.com"
                                    value={orgWebsite}
                                    onChange={(e) => setOrgWebsite(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Invite Members */}
                    {currentStep === "members" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Invite Team Members</h2>
                                <p className="text-muted-foreground mb-6">
                                    Add team members to collaborate (you can skip this and invite later)
                                </p>
                            </div>

                            {/* Add Member Form */}
                            <Card className="p-4 bg-muted/50">
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <Input
                                            type="email"
                                            placeholder="Email address"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault()
                                                    addMember()
                                                }
                                            }}
                                        />
                                    </div>
                                    <Select value={newRole} onValueChange={(value: "admin" | "member") => setNewRole(value)}>
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue placeholder="Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="member">Member</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={addMember} disabled={!newEmail}>
                                        <Plus className="size-4" />
                                        Add
                                    </Button>
                                </div>
                            </Card>

                            {/* Members List */}
                            {members.length > 0 ? (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium mb-3">
                                        Invited Members ({members.length})
                                    </h3>
                                    {members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between p-3 border border-border rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-10">
                                                    <AvatarFallback>
                                                        {member.email.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{member.email}</p>
                                                    <Badge variant={member.role === "admin" ? "secondary" : "outline"} className="mt-1 text-xs capitalize">
                                                        {member.role}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeMember(member.id)}
                                            >
                                                <Trash2 className="size-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                                    <Mail className="size-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No members invited yet</h3>
                                    <p className="text-muted-foreground">
                                        Add email addresses above to invite team members
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Connect Integrations */}
                    {currentStep === "integrations" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Connect Integrations</h2>
                                <p className="text-muted-foreground mb-6">
                                    Choose apps to integrate with your organization (optional)
                                </p>
                            </div>

                            {/* Integrations Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availableIntegrations.map((integration) => {
                                    const isSelected = selectedIntegrations.includes(integration.id)
                                    return (
                                        <Card
                                            key={integration.id}
                                            className={`p-4 cursor-pointer transition-all ${isSelected
                                                ? "border-primary bg-primary/5"
                                                : "hover:border-primary/50"
                                                }`}
                                            onClick={() => toggleIntegration(integration.id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className="p-2 rounded-lg bg-background border border-border">
                                                        {integration.icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold mb-1">{integration.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {integration.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div
                                                    className={`flex items-center justify-center size-6 rounded-full border-2 transition-colors ${isSelected
                                                        ? "bg-primary border-primary"
                                                        : "border-border"
                                                        }`}
                                                >
                                                    {isSelected && <Check className="size-4 text-primary-foreground" />}
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>

                            {selectedIntegrations.length > 0 && (
                                <div className="flex items-center gap-2 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                                    <CheckCircle2 className="size-5 text-primary" />
                                    <p className="text-sm">
                                        <span className="font-semibold">{selectedIntegrations.length}</span> integration
                                        {selectedIntegrations.length !== 1 && "s"} selected
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={currentStep === "details"}
                        >
                            <ArrowLeft className="size-4" />
                            Back
                        </Button>
                        <div className="flex items-center gap-3">
                            {currentStep !== "integrations" ? (
                                <Button onClick={handleNext} disabled={!canProceed()}>
                                    Next
                                    <ArrowRight className="size-4" />
                                </Button>
                            ) : (
                                <Button onClick={handleCreate} disabled={!canProceed()}>
                                    <Check className="size-4" />
                                    Create Organization
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Helper Text */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                    Need help? Check out our{" "}
                    <a href="#" className="text-primary hover:underline">
                        documentation
                    </a>{" "}
                    or{" "}
                    <a href="#" className="text-primary hover:underline">
                        contact support
                    </a>
                </p>
            </div>
        </div>
    )
}