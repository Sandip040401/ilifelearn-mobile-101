import { axiosJson, axiosMultipart } from "./apiClient";

export const saveEbookPage = (data) =>
    axiosMultipart.post("/ebooks/pages/save", data);

export const fetchEbooks = (category, subject) =>
    axiosJson.get(`/ebooks/${category}/${subject}`);

export const renameEbookTitle = (data) => axiosJson.put("/ebooks/rename", data);

export const renameVolumeTitle = (data) =>
    axiosJson.put("/ebooks/volumes/rename", data);

export const deleteEbookPage = (data) => axiosJson.post("/ebooks/delete", data)
