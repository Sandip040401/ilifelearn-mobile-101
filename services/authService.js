import { axiosJson } from "./apiClient";

export const registerUser = (data) => axiosJson.post("/learn/auth/register", data);

export const loginUser = (data) => axiosJson.post("/learn/auth/login", data);
