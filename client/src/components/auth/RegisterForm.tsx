import { useState } from "react";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";
import logo from "../../assets/logo.png";


export function RegisterForm({ authApi }: { authApi: IAuthAPIService }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "", fullName: ""});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(""); setLoading(true);
    const res = await authApi.register(form.username, form.email, form.password, form.fullName,"player");
    setLoading(false);
    if (!res.success || !res.data) { setError(res.message ?? "Registration failed"); return; }
    login(res.data);
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-2xl bg-bgprimary/10 border border-secondary/50 flex items-center justify-center mx-auto mb-4">
          <img src={logo} className="w-20 h-20 border border-secondary/50 rounded-2xl flex"/>
        </div>
        <h1 className="text-xl font-semibold text-bgsecondary">Create account</h1>
        <p className="text-sm text-secondary mt-1">Register to get started</p>
      </div>

      {error && (
        <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="flex flex-col gap-4">
        {(["username", "email", "password", "fullName"] as const).map((field) => (
          <div key={field}>
            <label className="block text-xs text-bgprimary mb-2 font-medium capitalize">{field === "fullName" ? "full Name" : field}</label>
            <input
              type={field === "password" ? "password" : field === "email" ? "email" : "text"}
              value={form[field]} onChange={set(field)} required
              className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"
              placeholder={field === "password" ? "Min 8 chars, 1 uppercase, 1 number" : ""} />
          </div>
        ))}
        <button type="submit" disabled={loading}
          className="mt-2 bg-bgprimary hover:bg-bgprimary/80 disabled:opacity-50 text-primary font-semibold rounded-xl py-3 text-sm transition-colors">
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-secondary/50 text-sm mt-6">
        Already have an account?{" "}
        <a href="/login" className="text-bgprimary hover:text-bgsecondary transition-colors">Sign in</a>
      </p>
    </div>
  );
}
