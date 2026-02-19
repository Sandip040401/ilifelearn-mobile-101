import { axiosJson } from "./apiClient";

export const getStudents = () => axiosJson.get("/learn/student");

export const getStudentsByGradeSection = (gradeId, sectionId) =>
    axiosJson.get(`/learn/users/students`, {
        params: { gradeId, sectionId }
    });
