import { apiClient, refreshClient } from "@/lib/api";

export const login = async ({ phoneNumber, email, password }: { phoneNumber?: string; email?: string; password: string }) => {
    const response = await apiClient.post(`/auth/sign-in`, { phoneNumber, email, password });
    return response.data;
};

export const register = async ({ firstName, lastName, phoneNumber, email, password }: { firstName: string; lastName: string; email?: string; phoneNumber?: string; password: string }) => {
    const response = await apiClient.post(`/auth/sign-up`, { firstName, lastName, phoneNumber, email, password });
    return response.data;
};

export const verify = async ({ otpString, phoneNumber, email }: { otpString: string; phoneNumber?: string; email?: string }) => {
    const response = await apiClient.post(`/auth/verify-otp`, { otpString, phoneNumber, email });
    return response.data;
}

export const logout = async () => {
    await apiClient.put(`/auth/logout`);
};

export const fetchCurrentUser = async () => {
    const response = await apiClient.get(`/user/me`);
    return response.data;
};

export const refreshAccessToken = async () => {
    const response = await refreshClient.get(`/auth/refresh-token`);
    return response.data;
};