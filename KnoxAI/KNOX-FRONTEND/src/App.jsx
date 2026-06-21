import SignupPage from "./pages/signup";
import Explore from "./pages/Explore.jsx";
import Login from "./pages/login";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import ChatPage from "./pages/chatpage.jsx";
import CharacterCreate from "./components/CharacterCreate.jsx";
import EditCharacter from "./components/EditCharacter.jsx";
import Profile from "./components/Profile.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Explore" element={<Explore />} />
        <Route path="/" element={<Explore />} />
        <Route path="/chat/:characterId" element={<ChatPage />} />
        <Route path="/character/create" element={<CharacterCreate />} />
        <Route path="/character/edit/:id" element={<EditCharacter />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

export default App;
