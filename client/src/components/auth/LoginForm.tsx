import { useState } from "react";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";

export function LoginForm({ authApi }: { authApi: IAuthAPIService }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(""); setLoading(true);
    const res = await authApi.login(username, password);
    setLoading(false);
    if (!res.success || !res.data) { setError(res.message ?? "Invalid credentials"); return; }
    login(res.data);
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-2xl bg-bgprimary/10 border border-secondary/50 flex items-center justify-center mx-auto mb-4">
          <span className="text-bgsecondary text-lg">◈</span>
        </div>
        <h1 className="text-xl font-semibold text-bgsecondary">Welcome back</h1>
        <p className="text-sm text-secondary mt-1">Sign in to your account</p>
      </div>

      {error && (
        <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs text-bgprimary mb-2 font-medium">Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} required
            className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"
            placeholder="your_username" />
        </div>
        <div>
          <label className="block text-xs text-bgprimary mb-2 font-medium">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"
            placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading}
          className="mt-2 bg-bgprimary hover:bg-bgprimary/80 disabled:opacity-50 text-primary font-semibold rounded-xl py-3 text-sm transition-colors">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-secondary/50 text-sm mt-6">
        Don't have an account?{" "}
        <a href="/register" className="text-bgprimary hover:text-bgsecondary transition-colors">Create one</a>
      </p>
    </div>
  );
}
