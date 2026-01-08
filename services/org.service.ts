import { apiClient } from "@/lib/api";
import { ExternalProvider, PredefinedOrgRole } from "@/types/enum";

export type CreateOrgPayload = {
    name: string;
    inviteMembers?: {
        email: string;
        predefinedRole: PredefinedOrgRole;
    }[];
    appProviders?: {
        provider: ExternalProvider;
    }[];
};

export const createOrg = async (data: CreateOrgPayload) => {
    const response = await apiClient.post(`/orgs/create`, data);
    return response.data;
};

export type UserOrgsFilters = {
    keyword?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
};

export const userOrgs = async (params?: UserOrgsFilters) => {
    const response = await apiClient.get(`/orgs/user`, { params });
    return response.data;
};

export const userOrgById = async (id: string) => {
    const response = await apiClient.get(`/orgs/user/byId/${id}`);
    return response.data;
};

export const userOrgBySlug = async (slug: string) => {
    const response = await apiClient.get(`/orgs/user/bySlug/${slug}`);
    return response.data;
};