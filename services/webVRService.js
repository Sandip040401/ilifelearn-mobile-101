import { axiosJson, axiosMultipart } from "./apiClient";

export const createUpdateWebVRTopic = (data) =>
    axiosMultipart.post("/webvr/save-topic", data);

export const fetchWebVRContent = (folderId) =>
    axiosJson.get(`/webvr/${folderId}`);

export const getAllWebVRContents = () => axiosJson.get("/webvr/all");

export const switchWebVRFolder = (data) =>
    axiosJson.post("/webvr-folder", data);

export const fetchWebVRFolders = (category, subject) =>
    axiosJson.get("/webvr-folder", {
        params: { category, subject },
    });
