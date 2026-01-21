"use client"

import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
    const router = useRouter();
    const { user } = useAuthStore((state) => state.auth);

    useEffect(() => {
        if (user && user.memberships && user.memberships.length === 0) {
            router.replace(`/organizations`)
        }
    }, [user]);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Dashboard Overview
                    </p>
                </div>
            </div>
        </div>
    )
}