"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth.store";
import { apiClient } from "@/lib/api";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { setUser } = useAuthStore.getState().auth;

    async function handleLogin() {
        const res = await apiClient.post("/auth/login", { email, password });
        setUser(res.data.user);
    }

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="p-8 bg-white rounded-xl shadow-md w-96">
                <h1 className="text-2xl font-semibold mb-4">Login</h1>

                <Input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mb-3"
                />

                <Input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mb-4"
                />

                <Button className="w-full" onClick={handleLogin}>Login</Button>
            </div>
        </div>
    );
}
