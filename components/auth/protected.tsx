"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

export default function Protected({ children }: { children: React.ReactNode }) {
    const { user, isLoading, fetchUser } = useAuthStore((state) => state.auth);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (!isLoading && !user) {
            const search = new URLSearchParams({ from: pathname }).toString();
            router.replace(`/signin?${search}`);
        }
    }, [isLoading, user, pathname, router]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="w-full max-w-md p-6 space-y-4 shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-linear-to-br from-primary to-purple-600 flex items-center justify-center animate-pulse">
                            <Sparkles className="size-5 text-primary-foreground animate-spin" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Preparing your workspace</p>
                            <p className="font-semibold">Checking authentication...</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-2/3" />
                    </div>
                    <div className="flex items-center justify-center gap-1">
                        <div className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                        Hang tight while we verify your session and load your data.
                    </p>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}