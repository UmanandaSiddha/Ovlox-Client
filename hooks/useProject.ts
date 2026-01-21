import { useProjectStore } from "@/store/project.store";
import { useRouter } from "next/navigation";
import { getProject } from "@/services/project.service";
import { IProject } from "@/types/prisma-generated";

export const useProject = () => {
    const { currentProject, setCurrentProject, clearCurrentProject } = useProjectStore();
    const router = useRouter();

    const selectProject = async (project: IProject, orgId?: string) => {
        setCurrentProject(project);
        if (orgId) {
            router.push(`/organizations/${orgId}/projects/${project.id}`);
        } else {
            router.push(`/projects/${project.id}`);
        }
    };

    const loadProject = async (orgId: string, projectId: string) => {
        try {
            const project = await getProject(orgId, projectId);
            setCurrentProject(project);
            return project;
        } catch (error) {
            console.error("Failed to load project", error);
            throw error;
        }
    };

    return {
        currentProject,
        setCurrentProject,
        selectProject,
        loadProject,
        clearCurrentProject,
    };
};
