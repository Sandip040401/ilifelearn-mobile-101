import { axiosJson } from "./apiClient";

export const fetchAllUsers = () => axiosJson.get("/learn-user");

export const updateUserSidebarSettings = (userId, data) =>
    axiosJson.put(`/learn-user/${userId}/sidebar-settings`, data);
