import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../api/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn } from "lucide-react";

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
    <div className="flex items-center justify-center min-h-screen p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border p-8 rounded-xl shadow-2xl w-full max-w-sm space-y-5 animate-fade-in-up"
      >
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">EinSolchesDing</h1>
          <p className="text-muted-foreground text-sm">Admin Login</p>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive border border-destructive/30 p-3 rounded-lg text-sm animate-fade-in">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          <LogIn className="h-4 w-4" />
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}
