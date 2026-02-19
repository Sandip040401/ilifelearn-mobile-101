import { axiosJson } from "./apiClient";

export const trackStudentActivity = async (activityData) => {
    try {
        const response = await axiosJson.post('/learn/track/track-activity', activityData);
        return response.data;
    } catch (error) {
        console.error('Error tracking activity:', error);
        throw error;
    }
};

export const getStudentsOverview = async () => {
    try {
        const response = await axiosJson.get('/learn/track/overview');
        return response.data;
    } catch (error) {
        console.error('Error fetching student activity overview:', error);
        throw error;
    }
};

export const getStudentAnalytics = async (studentId) => {
    try {
        const response = await axiosJson.get(`/learn/track/student/${studentId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching student analytics:', error);
        throw error;
    }
};

export const addVideoActivity = async (data) => {
    try {
        const response = await axiosJson.post('/learn/user-activity/video', data);
        return response.data;
    } catch (error) {
        console.error('Error adding video activity:', error);
        throw error;
    }
};

export const addDownloadActivity = async (data) => {
    try {
        const response = await axiosJson.post('/learn/user-activity/download', data);
        return response.data;
    } catch (error) {
        console.error('Error adding download activity:', error);
        throw error;
    }
};

export const addReadAloudActivity = async (data) => {
    try {
        const response = await axiosJson.post('/learn/user-activity/readaloud', data);
        return response.data;
    } catch (error) {
        console.error('Error adding read aloud activity:', error);
        throw error;
    }
};

export const addTimeSpentActivity = async (data) => {
    try {
        const response = await axiosJson.post('/learn/user-activity/timespent', data);
        return response.data;
    } catch (error) {
        console.error('Error adding time spent activity:', error);
        throw error;
    }
};

export const getActivityStats = async (params) => {
    try {
        const response = await axiosJson.get('/learn/user-activity/stats', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching activity stats:', error);
        throw error;
    }
};

export const getWeeklyData = async (params) => {
    try {
        const response = await axiosJson.get('/learn/user-activity/weekly', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching weekly data:', error);
        throw error;
    }
};

export const getRecentActivity = async (params) => {
    try {
        const response = await axiosJson.get('/learn/user-activity/recent', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        throw error;
    }
};

export const getActivityDetails = async (params) => {
    try {
        const response = await axiosJson.get('/learn/user-activity/details', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching activity details:', error);
        throw error;
    }
};
