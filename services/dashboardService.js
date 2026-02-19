import { axiosJson } from "./apiClient";

export const getDirectorDashboard = async () => {
    try {
        const response = await axiosJson.get('/learn/director');
        return response.data;
    } catch (error) {
        console.error('Error fetching director dashboard:', error);
        throw error;
    }
};

export const getPrincipalDashboard = async () => {
    try {
        const response = await axiosJson.get('/learn/principal');
        return response.data;
    } catch (error) {
        console.error('Error fetching principal dashboard:', error);
        throw error;
    }
};
