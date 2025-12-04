"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Protected({ children }: { children: string }) {
    const authStore = useAuthStore.getState().auth;
    const router = useRouter();

    useEffect(() => {
        if (!authStore.user) router.push("/signin");
    }, [authStore]);

    if (!authStore.user) return null;

    return children;
}