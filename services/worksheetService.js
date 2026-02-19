import { axiosJson, axiosMultipart, multipartConfig } from "./apiClient";

export const addStudentWorksheetImages = async (data) => {
    try {
        const response = await axiosMultipart.post('/learn/student-worksheet/add', data, multipartConfig);
        return response.data;
    } catch (error) {
        console.error('Error adding student worksheet images:', error);
        throw error;
    }
};

export const getDashboardWorksheets = async () => {
    try {
        const response = await axiosJson.get('/learn/dashboardworksheet/student');
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard worksheets:', error);
        throw error;
    }
};

export const getTeacherDashboard = async () => {
    try {
        const response = await axiosJson.get('/learn/dashboardworksheet/teacher');
        return response.data;
    }
    catch (error) {
        console.error('Error fetching teacher dashboard:', error);
        throw error;
    }
};
