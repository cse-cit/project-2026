import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "";

const MessageAPI = axios.create({
  baseURL: `${baseURL}/api/chat`,
  withCredentials: true,
});

export const getMessagesByConversationId = (conversationId) =>
  MessageAPI.get(`/${conversationId}`);