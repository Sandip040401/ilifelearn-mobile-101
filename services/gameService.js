import { axiosJson } from "./apiClient";

export const getAllGames = (params) =>
    axiosJson.get("/learn/games", { params });

export const getGamesByTopic = (topicId) =>
    axiosJson.get(`/learn/games/topic/${topicId}`);
