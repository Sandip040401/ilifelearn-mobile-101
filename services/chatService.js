import useAuthStore from "@/store/authStore";
import { axiosJson } from "./apiClient";

// Note: apiBaseUrl is needed for the fetch-based sendChatMessage
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_API_BASE_URL || "";

/**
 * Create a new chat session
 */
export const createChatSession = () =>
    axiosJson.post("/learn/chat/new-session");

/**
 * Get all chat sessions for the current user
 */
export const getChatSessions = () =>
    axiosJson.get("/learn/chat/sessions-list");

/**
 * Get chat history for a specific session
 */
export const getChatHistory = (sessionId) =>
    axiosJson.get(`/learn/chat/history/${sessionId}`);

/**
 * Delete a chat session
 */
export const deleteChatSession = (sessionId) =>
    axiosJson.delete(`/learn/chat/session/${sessionId}`);

/**
 * Send a chat message with streaming response
 * This function returns a readable stream that needs to be processed
 */
export const sendChatMessage = async (sessionId, question, modes = []) => {
    const token = useAuthStore.getState().token;
    const params = new URLSearchParams({
        sessionId,
        question,
    });

    // Add modes as separate params
    if (modes && modes.length > 0) {
        modes.forEach((mode) => {
            params.append("modes", mode);
        });
    }

    const response = await fetch(
        `${apiBaseUrl}/api/learn/chat/chat?${params.toString()}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to send message");
    }

    return response.body;
};
