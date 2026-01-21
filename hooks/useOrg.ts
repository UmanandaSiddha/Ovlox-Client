import * as React from "react";
import { useOrgStore } from "@/store/org.store";
import { useRouter } from "next/navigation";
import { userOrgBySlug } from "@/services/org.service";
import { IOrganization } from "@/types/prisma-generated";

export const useOrg = () => {
    const { currentOrg, setCurrentOrg, clearCurrentOrg } = useOrgStore();
    const router = useRouter();

    const selectOrg = React.useCallback(async (org: IOrganization) => {
        setCurrentOrg(org);
        router.push(`/organizations/${org.slug}`);
    }, [router, setCurrentOrg]);

    const loadOrgBySlug = React.useCallback(async (slug: string) => {
        try {
            const { organization } = await userOrgBySlug(slug);
            setCurrentOrg(organization);
            return organization;
        } catch (error) {
            console.error("Failed to load organization", error);
            throw error;
        }
    }, [setCurrentOrg]);

    return {
        currentOrg,
        setCurrentOrg,
        selectOrg,
        loadOrgBySlug,
        clearCurrentOrg,
    };
};
