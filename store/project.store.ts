import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IProject } from "@/types/prisma-generated";

interface ProjectState {
    currentProject: IProject | null;
    setCurrentProject: (project: IProject | null) => void;
    clearCurrentProject: () => void;
}

export const useProjectStore = create<ProjectState>()(
    persist(
        (set) => ({
            currentProject: null,
            setCurrentProject: (project) => set({ currentProject: project }),
            clearCurrentProject: () => set({ currentProject: null }),
        }),
        {
            name: "project-storage",
        }
    )
);
