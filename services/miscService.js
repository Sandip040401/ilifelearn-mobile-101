import { axiosJson } from "./apiClient";

// AR Scanning
export const fetchARScanningSheets = (category, subject) =>
    axiosJson.get(`/ar/${category}/${subject}`);

// Resources
export const fetchResources = (category, subject) =>
    axiosJson.get(`/resources/${category}/${subject}`);

// Folders
export const createFolder = (data) => axiosJson.post("/folders", data);
export const getFolders = () => axiosJson.get("/folders");

// Parent Consent
export const sendParentConsentOTP = (data) => axiosJson.post("/learn/parent-email-verification/send-code", data);
export const verifyParentConsentOTP = (data) => axiosJson.post("/learn/parent-email-verification/verify", data);
export const resendParentConsentOTP = (data) => axiosJson.post("/learn/parent-email-verification/resend-code", data);

// Proxy Image
export const getImageEditorUploadUrl = (imageUrl) =>
    axiosJson.get("/proxy-image", { params: { url: imageUrl } });
