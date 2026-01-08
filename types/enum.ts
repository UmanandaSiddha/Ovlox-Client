export enum UserRole {
    ADMIN = "ADMIN",
    USER = "USER"
}

export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER"
}

export enum AccountType {
    GUEST = "GUEST",
    EMAIL = "EMAIL",
    PHONE = "PHONE",
    GOOGLE = "GOOGLE"
}

export enum AuthProvider {
    OTP = "OTP",
    PASSWORD = "PASSWORD",
    GOOGLE = "GOOGLE"
}

export enum PredefinedOrgRole {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    DEVELOPER = "DEVELOPER",
    VIEWER = "VIEWER",
    CEO = "CEO",
    CTO = "CTO",
}

export enum OrgMemberStatus {
    INVITED = "INVITED",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED"
}

export enum ExternalProvider {
    GITHUB = "GITHUB",
    SLACK = "SLACK",
    DISCORD = "DISCORD",
    NOTION = "NOTION",
    JIRA = "JIRA",
    FIGMA = "FIGMA"
}

export enum IntegrationAuthType {
    OAUTH = "OAUTH",
    APP_JWT = "APP_JWT",
    TOKEN = "TOKEN",
    SERVICE_ACCOUNT = "SERVICE_ACCOUNT"
}

export enum IntegrationStatus {
    CONNECTED = "CONNECTED",
    PROCESSING = "PROCESSING",
    NOT_CONNECTED = "NOT_CONNECTED"
}