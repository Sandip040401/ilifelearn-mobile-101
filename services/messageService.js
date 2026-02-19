import { axiosJson } from "./apiClient";

export const sendMessage = (data) =>
    axiosJson.post("/learn/messages", data);

export const getMessagesByGroup = (groupId, params) =>
    axiosJson.get(`/learn/messages/group/${groupId}`, { params });

export const getSharedLinksByGroup = (groupId) =>
    axiosJson.get(`/learn/messages/group/${groupId}/links`);

export const deleteMessage = (messageId) =>
    axiosJson.delete(`/learn/messages/${messageId}`);
