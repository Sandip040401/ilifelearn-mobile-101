import { axiosJson } from "./apiClient";

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_API_BASE_URL || "";
const MODALS_3D_BASE = `${apiBaseUrl}/api/modals-3d`;

/**
 * Fetch all 3D models from the API
 */
export const fetchAllModals = async () => {
    try {
        const response = await fetch(MODALS_3D_BASE);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(`Failed to fetch models: ${error.message}`);
    }
};

/**
 * Fetch a single model by ID
 */
export const fetchModalById = async (id) => {
    try {
        const response = await fetch(`${MODALS_3D_BASE}/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(`Failed to fetch model: ${error.message}`);
    }
};

/**
 * Get the URL for the 3D model file (GLB/GLTF)
 */
export const getModelFileUrl = (id) => {
    return `${MODALS_3D_BASE}/${id}/file`;
};

/**
 * Get the preview image URL for a model
 */
export const getPreviewImageUrl = (id) => {
    return `${MODALS_3D_BASE}/${id}/preview`;
};

/**
 * Fetch audio metadata for a model
 */
export const fetchModalAudios = async (id) => {
    try {
        const response = await fetch(`${MODALS_3D_BASE}/${id}/audios`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(`Failed to fetch modal audios: ${error.message}`);
    }
};

/**
 * Get audio URL by language
 */
export const getModalAudioUrl = (id, language) => {
    return `${MODALS_3D_BASE}/${id}/audio/${encodeURIComponent(language)}`;
};

/**
 * Get audio stream URL by audio GridFS ID
 */
export const getAudioStreamUrlById = (audioId) => {
    return `${MODALS_3D_BASE}/audio/${audioId}`;
};

/**
 * Get folders (environments) from the API
 */
export const getARFolders = () => axiosJson.get("/folders");
