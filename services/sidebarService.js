import { axiosJson } from "./apiClient";

export const fetchSidebarSettings = () =>
    axiosJson.get("/learn-user/sidebar-settings");

export const updateSidebarSettings = (data) =>
    axiosJson.put("/learn-user/sidebar-settings", data);

export const toggleSidebarItem = (data) =>
    axiosJson.patch("/learn-user/sidebar-settings/toggle", data);
