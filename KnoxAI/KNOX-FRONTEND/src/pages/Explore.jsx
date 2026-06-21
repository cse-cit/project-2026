import React, { useEffect, useState } from "react";
import CharacterCard from "../components/CharacterCard.jsx";
import { getAllCharacters, deleteCharacter } from "../api/character.js";
import Footer from "../components/Footer.jsx";
import { useUser } from "../context/UserContext.jsx";
import Header from "../components/Header.jsx";

const Explore = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const fetchCharacters = async () => {
    try {
      const res = await getAllCharacters();
      setCharacters(res.data.characters || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await deleteCharacter(id);
      setCharacters(characters.filter((char) => char._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  if (loading)
    return (
      <h2 className="h-screen bg-[#05050c] flex items-center justify-center text-purple-500 font-bold tracking-widest">
        Loading...
      </h2>
    );

  return (
    <>
      <Header user={user} />

      <div className="min-h-screen bg-linear-to-br from-[#0f172a] via-[#020617] to-[#020617] px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-4xl md:text-5xl font-extrabold mb-10 text-center
        bg-linear-to-r from-indigo-400 via-purple-500 to-cyan-400
        bg-clip-text text-transparent
        drop-shadow-[0_0_25px_rgba(99,102,241,0.6)]"
          >
            Explore Characters
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {characters.length > 0 ? (
              characters.map((char) => (
                <CharacterCard
                  key={char._id}
                  character={char}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <p className="text-gray-400 text-center col-span-full mt-10">
                No characters found ✨ Create your first one!
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Explore;
