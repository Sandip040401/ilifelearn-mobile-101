import { axiosJson, axiosMultipart } from "./apiClient";

export const createUpdateConcept = (data) =>
    axiosMultipart.post("/concepts/topic", data);

export const fetchConcepts = (category, subject) =>
    axiosJson.get("/concepts", {
        params: { category, subject },
    });

export const deleteTopicAPI = (category, subject, volumeId, topicId) =>
    axiosJson.post(`/concepts`, {
        data: {
            category,
            subject,
            volumeId,
            topicId
        }
    });

export const fetchConceptsForHome = (category, subject) =>
    axiosJson.get(`/home/concepts/${category}/${subject}`);

export const updateCategorizedImages = async (data) => {
    try {
        const response = await axiosJson.put('/concepts/categorize-images', data);
        return response;
    } catch (error) {
        console.error('Error updating categorized images:', error);
        throw error;
    }
};
