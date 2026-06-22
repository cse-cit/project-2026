import React from "react";
import { useNavigate } from "react-router-dom";
// Using standard Lucide-style SVG paths for a professional look
import { Pencil, Trash2, ArrowRight } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "";

const CharacterCard = ({ character, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/chat/${character._id}`)}
      className="group relative min-h-[20rem] h-full bg-gradient-to-b from-[#a8bdff] to-[#e6c4ff] border border-white/10 rounded-3xl p-5 sm:p-6 transition-all duration-500 cursor-pointer hover:border-indigo-500/30 hover:-translate-y-2 overflow-hidden flex flex-col"
    >
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-600/10 blur-[80px] group-hover:bg-indigo-600/20 transition-all duration-500" />

      {/* Action Buttons */}
      <div
        className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-2 z-10 
        opacity-100 lg:opacity-0 lg:group-hover:opacity-100 
        lg:translate-x-4 lg:group-hover:translate-x-0 transition-all duration-300"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/character/edit/${character._id}`);
          }}
          className="p-2.5 bg-white/20 lg:bg-white/5 hover:bg-white/30 rounded-xl border border-white/20 text-indigo-900 lg:text-white/60 lg:hover:text-white transition-all shadow-sm flex items-center justify-center"
          title="Edit Character"
        >
          <Pencil size={18} strokeWidth={2.5} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(character._id);
          }}
          className="p-2.5 bg-red-500/10 lg:bg-red-500/5 hover:bg-red-500/20 rounded-xl border border-red-500/20 text-red-600 lg:text-red-400/60 lg:hover:text-red-400 transition-all shadow-sm flex items-center justify-center"
          title="Delete Character"
        >
          <Trash2 size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-between gap-4">
        <div className="relative mt-4">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
          <img
            src={character.avatar?.startsWith('http') 
              ? character.avatar 
              : `${BACKEND_URL}${character.avatar}`}
            alt={character.name}
            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-[3px] border-white/50 group-hover:border-white transition-all duration-500 shadow-lg"
          />
        </div>

        <div className="text-center w-full px-2">
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900">
            {character.name}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-zinc-700 line-clamp-2 italic">
            "{character.description}"
          </p>
        </div>

        <div className="w-full">
          <div className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/30 lg:bg-white/10 group-hover:bg-indigo-600 transition-all text-sm font-bold text-zinc-800 group-hover:text-white border border-white/40 group-hover:border-indigo-400 shadow-sm">
            <span>Chat Now</span>
            <ArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;