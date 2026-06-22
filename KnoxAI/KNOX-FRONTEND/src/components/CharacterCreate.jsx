import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// FIXED: Standardize the URL handling for Vite
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "";

const CharacterCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    creator: "",
    category: "",
    greeting: "",
    isPublic: true,
    personalityPrompt: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    if (avatar) data.append("avatar", avatar);

    try {
      setLoading(true);
      // FIXED: Ensure path matches your backend route and handles Vercel proxying
      await axios.post(`${BACKEND_URL}/api/character/add`, data, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("🔥 Character created!");
      navigate("/Explore");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "❌ Failed to create character");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all duration-300 hover:bg-white/10 text-sm sm:text-base";
  const labelClasses =
    "block text-[10px] sm:text-xs font-semibold text-slate-400 mb-1.5 ml-1 uppercase tracking-wider";

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#05050c] p-4 sm:p-6 relative overflow-x-hidden">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] p-2.5 sm:p-3 flex items-center justify-center rounded-xl sm:rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 group shadow-2xl"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:-translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden md:block ml-2 text-sm font-bold pr-1">Back</span>
      </button>

      <div className="absolute top-0 left-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-purple-600/10 rounded-full blur-[80px] sm:blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-pink-600/10 rounded-full blur-[70px] sm:blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-6 sm:p-8 md:p-10 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 mt-16 mb-8 md:my-0"
      >
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
            Forge Character
          </h2>
          <p className="text-slate-500 mt-2 text-xs sm:text-sm font-medium">
            Design your next digital legend
          </p>
        </div>

        <div className="space-y-4 sm:space-y-5">
          <div>
            <label className={labelClasses}>Character Name</label>
            <input
              className={inputClasses}
              type="text"
              name="name"
              placeholder="e.g. Luna Moonstone"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="group relative border-2 border-dashed border-white/10 rounded-xl p-3 sm:p-4 transition-colors hover:border-purple-500/50 bg-white/[0.02]">
            <input
              className="w-full text-xs sm:text-sm text-slate-400 file:mr-3 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 transition-all cursor-pointer"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Creator</label>
              <input
                className={inputClasses}
                type="text"
                name="creator"
                placeholder="Your name"
                value={formData.creator}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className={labelClasses}>Category</label>
              <input
                className={inputClasses}
                type="text"
                name="category"
                placeholder="e.g. Anime, Villain"
                value={formData.category}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>First Greeting</label>
            <textarea
              className={`${inputClasses} resize-none h-20 sm:h-24 border-indigo-500/20`}
              name="greeting"
              placeholder="What is the first thing this character says to you?"
              value={formData.greeting}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className={labelClasses}>Short Bio</label>
            <textarea
              className={`${inputClasses} resize-none h-20 sm:h-24`}
              name="description"
              placeholder="A brief public tagline..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className={labelClasses}>Personality Prompt</label>
            <textarea
              className={`${inputClasses} resize-none h-24 sm:h-32`}
              name="personalityPrompt"
              placeholder="Deep-dive into their behavior, speech patterns, and secrets..."
              value={formData.personalityPrompt}
              onChange={handleChange}
            />
          </div>

          <label className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/[0.04] cursor-pointer hover:bg-white/[0.07] transition-all group">
            <span className="text-xs sm:text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
              Visible to Public
            </span>
            <input
              type="checkbox"
              name="isPublic"
              className="w-4 h-4 sm:w-5 sm:h-5 accent-purple-500 rounded border-none focus:ring-0"
              checked={formData.isPublic}
              onChange={handleChange}
            />
          </label>

          <button
            className="w-full py-3.5 sm:py-4 mt-2 rounded-xl font-bold text-sm sm:text-base text-white transition-all duration-500 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-[length:200%_auto] hover:bg-right shadow-[0_10px_30px_-10px_rgba(139,92,246,0.5)] active:scale-[0.98] disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? "Forging..." : "✦ Create Character"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CharacterCreate;