import { AccountType, AuthProvider, ExternalProvider, Gender, IntegrationAuthType, IntegrationStatus, OrgMemberStatus, PredefinedOrgRole, UserRole } from "./enum";

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export interface IUser {
    id: string;
    email: string | null;
    phoneNumber: string | null;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    dateOfBirth: string | null;
    isVerified: boolean;
    isOnline: boolean;
    gender: Gender | null;
    role: UserRole;
    lastLogin: string | null;

    // relations simplified:
    authIdentities?: IAuthIdentity[];
    memberships?: IOrganizationMember[];
};

export interface IAuthIdentity {
    id: string;
    provider: AuthProvider;
    providerId: string;
    type: AccountType;
    createdAt: string;
};

export interface IOrganization {
    id: string;
    name: string;
    slug: string;
    ownerId: string;
    owner: IUser;
    plan?: string | null;
    createdAt: Date;
    updatedAt: Date;

    // Relations
    members: IOrganizationMember[];
    projects: IProject[]
    integrations: IIntegration[]
}

export interface IOrganizationMember {
    id: string;
    organization: IOrganization;
    organizationId: string;
    user: IUser;
    userId: string;
    predefinedRole?: PredefinedOrgRole | null;
    roleId?: string | null;
    // role?: RoleTemplate | null;
    status: OrgMemberStatus;
    invitedBy?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface IIntegration {
    id: string;
    organization?: IOrganization;
    organizationId: string;
    type: ExternalProvider;
    authType: IntegrationAuthType;
    config?: Record<string, any>;
    status: IntegrationStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface IProject {
    id: string;
    organization?: IOrganization;
    organizationId: string;
    name: string;
    slug: string;
    description?: string;
    createdById: string;
    createdBy?: IUser;
    settings?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;

    integrations: IIntegrationConnection[]
}

export interface IIntegrationConnection {
    id: string;
    project?: IProject;
    projectId: string;
    integration?: IIntegration;
    integrationId: string;
    items: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
