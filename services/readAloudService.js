import { axiosJson, axiosMultipart, multipartConfig } from "./apiClient";

export const readAloudAttempts = (studentId, payload) => axiosJson.post(`/learn/user/student/${studentId}/attempts`, payload);

export const getReadAloudAttempts = (studentId) => axiosJson.get(`/learn/user/student/${studentId}/attempts`);

export const getReadAloudStudentDashboard = async (studentId) => {
    const res = await axiosJson.get(`/learn/user/student/${studentId}/read-aloud-student-dashboard`);
    return res.data;
};

export const getReadAloudTeacherDashboard = async () => {
    const res = await axiosJson.get(`/learn/user/read-aloud-teacher-dashboard`);
    return res.data;
};

export const createAgeGroup = (data) =>
    axiosJson.post("/learn/readaloud/age", data);

export const addWordsToAgeGroup = (age, formData) =>
    axiosMultipart.post(`/learn/readaloud/${age}/words`, formData, multipartConfig);

export const addSentencesToAgeGroup = (age, formData) =>
    axiosMultipart.post(`/learn/readaloud/${age}/sentences`, formData, multipartConfig);

export const addStoriesToAgeGroup = (age, formData) =>
    axiosMultipart.post(`/learn/readaloud/${age}/stories`, formData, multipartConfig);

export const getAgeGroups = () => axiosJson.get("/learn/readaloud");

export const getReadAloudByAge = (age) => axiosJson.get(`/learn/readaloud/${age}`);

export const getAllReadAloud = () => axiosJson.get("/learn/readaloud/all");
