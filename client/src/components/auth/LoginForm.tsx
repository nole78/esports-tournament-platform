import { useState } from "react";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";
import logo from "../../assets/logo.png";


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
    <div className="surface w-full max-w-sm p-6 sm:p-8">
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-2xl bg-bgprimary/10 border border-secondary/50 flex items-center justify-center mx-auto mb-4">
          <img src={logo} alt="PulseGrid logo" width="80" height="80" className="h-20 w-20 rounded-2xl border border-secondary/50"/>
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
          <label htmlFor="username" className="mb-2 block text-sm font-medium text-bgsecondary">Username</label>
          <input id="username" name="username" autoComplete="username" type="text" value={username} onChange={e => setUsername(e.target.value)} required
            className="control w-full px-4 py-3 text-sm"
            placeholder="your_username…" />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-bgsecondary">Password</label>
          <input id="password" name="password" autoComplete="current-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required
            className="control w-full px-4 py-3 text-sm"
            placeholder="Enter your password…" />
        </div>
        <button type="submit" disabled={loading}
          className="mt-2 min-h-11 rounded-xl bg-bgprimary py-3 text-sm font-semibold text-primary transition-colors hover:bg-bgprimary/80 disabled:opacity-50">
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
