enum UserRole {
    ADMIN,
    USER
}

enum Gender {
    MALE,
    FEMALE,
    OTHER
}

enum AccountType {
    GUEST,
    EMAIL,
    PHONE,
    GOOGLE
}

enum AuthProvider {
    OTP,
    PASSWORD,
    GOOGLE
}

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export interface IUser {
    id: string;
    email?: string | null;
    phoneNumber?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    password?: string | null;
    authToken?: string | null;
    isVerified: boolean;
    isOnline: boolean;
    oneTimePassword?: string | null;
    avatarUrl?: string | null;
    dateOfBirth?: Date | null;
    lastLogin?: Date | null;
    oneTimeExpire?: Date | null;
    resetToken?: string | null;
    resetTokenExpire?: Date | null;
    accountType: AccountType[];
    authProvider: AuthProvider[];
    role: UserRole;
    gender?: Gender | null;
    createdAt: Date;
    updatedAt: Date;
}
