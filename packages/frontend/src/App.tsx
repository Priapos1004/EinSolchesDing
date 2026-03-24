import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import CreateGame from "./pages/CreateGame";
import JoinGame from "./pages/JoinGame";
import Game from "./pages/Game";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/create" element={<CreateGame />} />
        <Route path="/join/:gameId" element={<JoinGame />} />
        <Route path="/game/:gameId" element={<Game />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </div>
  );
}
