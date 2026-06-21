import { useNavigate } from "react-router-dom";

export default function AuthHeader() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 h-[72px] px-8 flex items-center justify-between
      bg-linear-to-b from-black/80 to-black/60
      backdrop-blur-xl border-b border-white/10">

      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        className="border-2 border-white px-3 py-1
          text-white text-2xl font-extrabold tracking-tight
          cursor-pointer hover:opacity-90 transition"
      >
        (AlterAI)
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/signup")}
          className="px-5 py-2 rounded-full
            bg-white text-black font-semibold text-sm
            hover:scale-105 hover:shadow-lg
            transition-all"
        >
          Sign Up to Chat
        </button>

        <button
          onClick={() => navigate("/login")}
          className="px-5 py-2 rounded-full
            border border-white/30 text-white text-sm font-medium
            hover:bg-white/10 transition"
        >
          Login
        </button>
      </div>
    </header>
  );
}
