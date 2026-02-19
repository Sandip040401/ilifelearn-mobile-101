import { axiosJson } from "./apiClient";

export const createGroup = (data) =>
    axiosJson.post("/learn/groups", data);

export const getAllGroups = () =>
    axiosJson.get("/learn/groups");

export const getGroupById = (groupId) =>
    axiosJson.get(`/learn/groups/${groupId}`);

export const updateGroup = (groupId, data) =>
    axiosJson.put(`/learn/groups/${groupId}`, data);

export const deleteGroup = (groupId) =>
    axiosJson.delete(`/learn/groups/${groupId}`);

export const addMembersToGroup = (groupId, memberIds) =>
    axiosJson.post(`/learn/groups/${groupId}/members`, { memberIds });

export const removeMemberFromGroup = (groupId, memberId) =>
    axiosJson.delete(`/learn/groups/${groupId}/members/${memberId}`);
