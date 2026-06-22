import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "";

const API = axios.create({
  baseURL: `${baseURL}/api/character`,
  withCredentials: true,
});

export const getAllCharacters = () => API.get("/");
export const deleteCharacter = (id) => API.delete(`/${id}`);
export const getCharacterById = (id) => API.get(`/${id}`);