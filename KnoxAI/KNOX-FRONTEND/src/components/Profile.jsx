import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import axios from "axios";
import { Camera, Mail, User, Save, Edit2, ArrowLeft, Loader2 } from "lucide-react";

// FIXED: Ensure BACKEND_URL falls back to an empty string to avoid "undefined" errors
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "";

const ProfilePage = () => {
  const { user, setUser, loading } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      // FIXED: Safely handle the avatar URL construction
      if (user.avatar) {
        const fullUrl = user.avatar.startsWith('http') ? user.avatar : `${BACKEND_URL}${user.avatar}`;
        setPreviewUrl(fullUrl);
      } else {
        setPreviewUrl("");
      }
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const formData = new FormData();
    formData.append("name", name);
    if (avatar) formData.append("avatar", avatar);

    try {
      // FIXED: Ensure the PUT route matches your backend's update endpoint
      const res = await axios.put(`${BACKEND_URL}/api/auth/update`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setIsEditing(false);
      alert("Profile updated! ✨");
    } catch (err) {
      console.error("Update error:", err);
      alert(err.response?.data?.message || "Update failed.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="h-screen bg-[#05050c] flex items-center justify-center">
      <Loader2 className="animate-spin text-purple-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05050c] text-white p-4 sm:p-6 relative overflow-x-hidden flex flex-col items-center">
      <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-indigo-600/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl mt-4 sm:mt-10 relative z-10">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-4 sm:mb-6 flex items-center gap-2 text-slate-500 hover:text-white transition-colors group text-sm sm:text-base"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-10 shadow-2xl">
          <form onSubmit={handleUpdate} className="space-y-6 sm:space-y-8">
            
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden border-2 border-white/10 bg-zinc-900 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600">
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 p-2 sm:p-3 bg-purple-600 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-[#05050c] text-white hover:bg-purple-500 transition-all shadow-xl"
                  >
                    <Camera size={16} className="sm:w-5 sm:h-5" />
                  </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
              <p className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-widest">Profile Picture</p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input
                    readOnly={!isEditing}
                    value={name}
                    name="name"
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full bg-white/[0.05] border border-white/10 rounded-xl sm:rounded-2xl pl-11 pr-4 py-3 sm:py-4 text-xs sm:text-sm transition-all
                      ${isEditing ? "focus:ring-2 focus:ring-purple-500/50 border-purple-500/50 outline-none" : "text-slate-400 cursor-not-allowed"}`}
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                  <input
                    readOnly
                    value={user?.email || ""}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-xl sm:rounded-2xl pl-11 pr-4 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all text-sm"
                >
                  <Edit2 size={16} /> Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset preview to original
                      const originalUrl = user.avatar 
                        ? (user.avatar.startsWith('http') ? user.avatar : `${BACKEND_URL}${user.avatar}`)
                        : "";
                      setPreviewUrl(originalUrl);
                      setName(user.name || "");
                    }}
                    className="w-full sm:flex-1 py-3 sm:py-4 border border-white/10 rounded-xl sm:rounded-2xl font-bold hover:bg-white/5 transition-all text-sm order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full sm:flex-[2] py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-purple-900/40 active:scale-95 transition-all disabled:opacity-50 text-sm order-1 sm:order-2"
                  >
                    {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;