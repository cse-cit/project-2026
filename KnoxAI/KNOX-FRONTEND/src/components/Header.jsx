import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { logoutUser } from "../api/auth";
import { useUser } from "../context/UserContext";

// FIXED: Use Vite's environment variable syntax to prevent "process is not defined"
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "";

const Header = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      // FIXED: Clear local state and storage consistently
      setUser(null);
      localStorage.removeItem("user");
      setIsDropdownOpen(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout handled safely:", err);
      setUser(null);
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <header
      className="sticky top-0 z-50 h-20 w-full flex items-center justify-between px-4 md:px-8 
      backdrop-blur-xl bg-[#4d4d99]/90 border-b border-white/[0.08] transition-all duration-300"
    >
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      {/* Brand */}
      <Link to="/Explore" className="relative group cursor-pointer shrink-0">
        <div className="absolute -inset-2 bg-purple-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <span className="tracking-[0.3em] font-extralight text-white uppercase">
          KNOX <span className="text-indigo-500 font-black">.</span>
        </span>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {user ? (
          <div className="flex items-center gap-3 sm:gap-5 relative" ref={dropdownRef}>
            {/* Create Button */}
            <button
              onClick={() => navigate("/character/create")}
              className="relative flex items-center justify-center gap-2 h-10 w-10 sm:w-auto sm:px-5 rounded-xl font-bold text-xs uppercase tracking-widest text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all active:scale-95"
            >
              <span className="text-xl sm:text-lg leading-none">+</span>
              <span className="hidden sm:inline">Create</span>
            </button>

            {/* Avatar Trigger */}
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl cursor-pointer transition-all border 
              ${isDropdownOpen ? "bg-white/10 border-purple-500" : "bg-white/05 border-white/10 hover:border-purple-500/50"}`}
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white/10 border border-white/10">
                {user.avatar ? (
                  <img
                    /* FIXED: Conditional logic to handle full vs relative image paths */
                    src={user.avatar.startsWith('http') ? user.avatar : `${BACKEND_URL}${user.avatar}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-white uppercase">
                    {user.name?.charAt(0) || "U"}
                  </span>
                )}
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#4d4d99] rounded-full" />
            </div>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-14 right-0 w-48 sm:w-56 bg-[#0d0d12] backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl py-2 z-[100] animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-white/5 mb-1">
                  <p className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">
                    Account
                  </p>
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                </div>

                <button
                  onClick={() => {
                    navigate("/profile");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 font-semibold"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="px-4 sm:px-6 py-2 rounded-xl text-sm font-bold text-slate-300 border border-white/10 hover:bg-white/5 transition-all"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="hidden xs:block px-4 sm:px-6 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;