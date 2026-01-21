import { apiClient, refreshClient } from "@/lib/api";
import { AuthResponse, SignUpRequest, SignInRequest, RequestOtpRequest, VerifyOtpRequest } from "@/types/api-types";

export const login = async (params: SignInRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(`/auth/sign-in`, params);
    return response.data;
};

export const register = async (params: SignUpRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(`/auth/sign-up`, params);
    return response.data;
};

export const requestOtp = async (params: RequestOtpRequest) => {
    const response = await apiClient.post(`/auth/request-otp`, params);
    return response.data;
};

export const verifyOtp = async (params: VerifyOtpRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(`/auth/verify-otp`, params);
    return response.data;
};

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