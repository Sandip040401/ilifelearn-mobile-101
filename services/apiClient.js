import useAuthStore from "@/store/authStore";
import axios from "axios";

// Cross-OS API Base URL handling
// Using process.env which is supported by Expo for .env files
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_API_BASE_URL || "";

if (__DEV__) {
    console.log("API Base URL:", apiBaseUrl);
}

/* ---------- plain JSON instance ---------- */
export const axiosJson = axios.create({
    baseURL: `${apiBaseUrl}/api`,
    headers: { "Content-Type": "application/json" },
});

/* ---------- multipart instance ---------- */
export const axiosMultipart = axios.create({
    baseURL: `${apiBaseUrl}/api`,
});

/* ---------- common auth-token interceptor ---------- */
const attachToken = async (config) => {
    // Use the token directly from the Zustand store
    const token = useAuthStore.getState().token;

    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
};

axiosJson.interceptors.request.use(attachToken, (error) => Promise.reject(error));
axiosMultipart.interceptors.request.use(attachToken, (error) => Promise.reject(error));

/* ---------- helper to DRY the multipart headers ---------- */
export const multipartConfig = { headers: { "Content-Type": "multipart/form-data" } };
