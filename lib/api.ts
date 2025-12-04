import axios from "axios";
import Cookies from "js-cookie";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const refreshClient = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});

export const apiClient = axios.create({
    baseURL: API_BASE,
    withCredentials: true
});


let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token!);
    });
    failedQueue = [];
};

apiClient.interceptors.request.use(
    (config) => {
        const token = Cookies.get(ACCESS_TOKEN);
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (err) => Promise.reject(err)
);

apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((newToken) => {
                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return apiClient(originalRequest);
                    })
                    .catch((e) => Promise.reject(e));
            }

            isRefreshing = true;

            try {
                const { data } = await refreshClient.get("/auth/refresh-token");
                const newToken = data.accessToken as string;
                Cookies.set(ACCESS_TOKEN, newToken);
                apiClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
                processQueue(null, newToken);

                originalRequest.headers!["Authorization"] = `Bearer ${newToken}`;
                return apiClient(originalRequest);
            } catch (err) {
                processQueue(err, null);
                Cookies.remove(ACCESS_TOKEN);
                Cookies.remove(REFRESH_TOKEN);
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);