// However, the provided code had dedicated headers with localStorage.
// We will adapt it to use our axiosJson or keep the provided pattern.
import { axiosJson } from "./apiClient";

export const addToFavorites = async (resourceData) => {
    try {
        const response = await axiosJson.post('/favorites/add', resourceData);
        return response.data;
    } catch (error) {
        console.error('Error adding to favorites:', error);
        throw error;
    }
};

export const removeFromFavorites = async (resourceId) => {
    try {
        const response = await axiosJson.delete(`/favorites/remove/${resourceId}`);
        return response.data;
    } catch (error) {
        console.error('Error removing from favorites:', error);
        throw error;
    }
};

export const getFavorites = async () => {
    try {
        const response = await axiosJson.get('/favorites');
        return response.data;
    } catch (error) {
        console.error('Error fetching favorites:', error);
        throw error;
    }
};

export const checkIfFavorite = async (resourceId) => {
    try {
        const response = await axiosJson.get(`/favorites/check/${resourceId}`);
        return response.data;
    } catch (error) {
        console.error('Error checking favorite status:', error);
        throw error;
    }
};
