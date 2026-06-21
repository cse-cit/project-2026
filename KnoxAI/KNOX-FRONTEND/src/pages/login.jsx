import React, { useState } from "react";
import { loginUser } from "../api/auth.js";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  // --- NEW LOADING STATE ---
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    // Start Loading
    setIsLoading(true);

    try {
      const res = await loginUser(formData);
      setSuccessMsg(res.data.message || "Login successful!");

      setTimeout(() => {
        setSuccessMsg("");
      }, 3000);

      setUser(res.data.user);
      navigate("/Explore");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed!";
      setErrorMsg(msg);

      setTimeout(() => {
        setErrorMsg("");
      }, 3000);
    } finally {
      // --- STOP LOADING REGARDLESS OF SUCCESS OR ERROR ---
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all duration-300 hover:bg-white/10";
  const labelClasses = "block text-xs font-semibold text-slate-400 mb-1.5 ml-1 uppercase tracking-wider";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#05050c] p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px] -translate-x-1/4 translate-y-1/4" />

      <div className="relative w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
            Welcome Back
          </h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">Enter your credentials to continue</p>
        </div>

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-sm font-medium text-center p-3 rounded-xl mb-6">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm font-medium text-center p-3 rounded-xl mb-6">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className={labelClasses}>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              className={inputClasses}
              required
              disabled={isLoading} // Disable input while loading
            />
          </div>

          <div className="group">
            <label className={labelClasses}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className={inputClasses}
              required
              disabled={isLoading} // Disable input while loading
            />
          </div>

          <button
            type="submit"
            disabled={isLoading} // --- PREVENTS DOUBLE SUBMIT ---
            className={`w-full py-4 mt-2 rounded-xl font-bold text-white transition-all duration-500 flex items-center justify-center
              bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-[length:200%_auto] hover:bg-right
              ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-[0_10px_30px_-10px_rgba(168,85,247,0.5)] active:scale-[0.98]'}`}
          >
            {isLoading ? (
              <>
                {/* --- TAILWIND SPINNER SVG --- */}
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-8 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-purple-400 font-semibold hover:text-pink-400 transition-colors hover:underline underline-offset-4">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;