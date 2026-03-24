import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../api/http";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await adminLogin(username, password);
      localStorage.setItem("adminToken", token);
      navigate("/admin/create");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">EinSolchesDing</h1>
        <p className="text-gray-400 text-center text-sm">Admin Login</p>

        {error && (
          <div className="bg-red-900/50 text-red-300 p-3 rounded text-sm">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-amber-500 focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-amber-500 focus:outline-none"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-amber-600 hover:bg-amber-700 rounded font-semibold disabled:opacity-50 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
