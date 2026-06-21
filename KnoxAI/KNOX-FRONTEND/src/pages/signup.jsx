import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      setErrorMsg("Please enter a valid email address.");

      setTimeout(() => {
        setErrorMsg("");
      }, 3000);

      return;
    }

    // Password validation
    if (formData.password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");

      setTimeout(() => {
        setErrorMsg("");
      }, 3000);

      return;
    }

    try {
      const res = await axios.post(
        `${baseURL}/api/auth/signup`,
        formData
      );

      setSuccessMsg(res.data.message || "Signup successful!");

      // Clear form after successful signup
      setFormData({
        name: "",
        email: "",
        password: "",
      });

      setTimeout(() => {
        setSuccessMsg("");
      }, 3000);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Signup failed!";

      setErrorMsg(msg);

      setTimeout(() => {
        setErrorMsg("");
      }, 3000);
    }
  };

  const inputClasses =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all duration-300 hover:bg-white/10";

  const labelClasses =
    "block text-xs font-semibold text-slate-400 mb-1.5 ml-1 uppercase tracking-wider";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#05050c] p-6 relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] -translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4" />

      <div className="relative w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
            Join the Forge
          </h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Create your legend today
          </p>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-sm font-medium text-center p-3 rounded-xl mb-6">
            {successMsg}
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm font-medium text-center p-3 rounded-xl mb-6">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="group">
            <label className={labelClasses}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>

          {/* Email */}
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
            />
          </div>

          {/* Password */}
          <div className="group">
            <label className={labelClasses}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
              className={inputClasses}
              minLength={8}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 mt-4 rounded-xl font-bold text-white transition-all duration-500 
                       bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-[length:200%_auto] hover:bg-right
                       shadow-[0_10px_30px_-10px_rgba(168,85,247,0.5)] active:scale-[0.98]"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-slate-400 mt-8 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-400 font-semibold hover:text-pink-400 transition-colors hover:underline underline-offset-4"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
