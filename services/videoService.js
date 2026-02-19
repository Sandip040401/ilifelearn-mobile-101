import { axiosJson } from "./apiClient";

export const fetchConceptVideos = (category, subject) =>
    axiosJson.get("/explanatory-videos/concept-videos", {
        params: { category, subject },
    });

export const addExplanatoryVideo = (data) =>
    axiosJson.post("/explanatory-videos", data);

export const fetchExplanatoryVideos = (category, subject) =>
    axiosJson.get("/explanatory-videos", {
        params: { category, subject },
    });
