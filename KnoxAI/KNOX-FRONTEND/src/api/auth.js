import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "";

const AuthAPI = axios.create({
  baseURL: `${baseURL}/api/auth`,
  withCredentials: true,
});

export const loginUser = (formData) => AuthAPI.post("/login", formData);
export const logoutUser = () => AuthAPI.post("/logout");

export const verifyUser = (setUser, setLoading) => {
  const checkAuth = async () => {
    try {
      const res = await AuthAPI.get("/profile");
      setUser(res.data.user);
    } catch (err) {
      if (err.response?.status === 401) {
        setUser(null);
      } else {
        console.error("Auth error:", err.message);
      }
    } finally {
      setLoading(false);
    }
  };
  checkAuth();
};