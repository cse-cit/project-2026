import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// FIXED: Use Vite's environment variable syntax to prevent "process is not defined"
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "";

function EditCharacter() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    personality: "",
    greeting: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        // FIXED: Ensure URL structure matches your GET route
        const res = await axios.get(`${BACKEND_URL}/api/character/${id}`, {
          withCredentials: true,
        });
        
        // Use res.data.character or res.data depending on your exact backend return
        setFormData(res.data.character || res.data);
        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setLoading(false);
      }
    };
    if (id) fetchCharacter();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // FIXED: Path updated to match standard PUT route structure
      await axios.put(`${BACKEND_URL}/api/character/edit/${id}`, formData, {
        withCredentials: true,
      });
      alert("✨ Character refined successfully!");
      navigate("/Explore");
    } catch (error) {
      console.error("Update error:", error);
      alert(error.response?.data?.message || "❌ Failed to update character");
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#05050c]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-lg tracking-widest animate-pulse">
            LOADING DATA...
          </p>
        </div>
      </div>
    );

  const inputClasses =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all duration-300 hover:bg-white/10 text-sm";
  const labelClasses =
    "block text-[10px] sm:text-xs font-semibold text-slate-400 mb-1.5 ml-1 uppercase tracking-wider";

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#05050c] p-4 sm:p-6 relative overflow-hidden">
      
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] 
                   p-2.5 sm:p-3 flex items-center justify-center 
                   rounded-xl sm:rounded-2xl 
                   bg-white/[0.03] backdrop-blur-md border border-white/10 
                   text-white/70 hover:text-white hover:bg-white/10 hover:border-purple-500/50 
                   transition-all duration-300 group shadow-2xl"
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

      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 
                   p-8 sm:p-10 rounded-[2rem] shadow-2xl 
                   animate-in fade-in slide-in-from-bottom-4 duration-700
                   mt-16 md:mt-0"
      >
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
            Edit Character
          </h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Refine your character's identity and essence.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className={labelClasses}>Character Name</label>
            <input
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              placeholder="e.g. Luna Moonstone"
              className={inputClasses}
              required
            />
          </div>

          <div>
            <label className={labelClasses}>Description / Tagline</label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="A short tagline..."
              className={`${inputClasses} resize-none h-20`}
            />
          </div>

          <div>
            <label className={labelClasses}>Personality & Traits</label>
            <textarea
              name="personality"
              value={formData.personality || ""}
              onChange={handleChange}
              placeholder="How do they act? What are their quirks?"
              className={`${inputClasses} resize-none h-28`}
            />
          </div>

          <div>
            <label className={labelClasses}>First Greeting</label>
            <textarea
              name="greeting"
              value={formData.greeting || ""}
              onChange={handleChange}
              placeholder="What's the first thing they say to a stranger?"
              className={`${inputClasses} resize-none h-24`}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3.5 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/5 hover:text-white transition-all order-2 sm:order-1"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-[length:200%_auto] hover:bg-right text-white font-bold shadow-lg active:scale-95 transition-all duration-500 order-1 sm:order-2"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EditCharacter;