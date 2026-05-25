import { useRef, useState } from "react";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";
import logo from "../../assets/logo.png";


export function RegisterForm({ authApi }: { authApi: IAuthAPIService }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", fullName: "", email: "", password: ""});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const [picture, setPicture] = useState<string>("");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const ref = useRef<HTMLInputElement>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(""); setLoading(true);
    const res = await authApi.register(form.username, form.email, form.password, form.fullName, picture, "player");
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
        {(["username", "fullName", "email", "password"] as const).map((field) => (
          <div key={field}>
            <label className="block text-xs text-bgprimary mb-2 font-medium capitalize">{field === "fullName" ? "full Name" : field}</label>
            <input
              type={field === "password" ? "password" : field === "email" ? "email" : "text"}
              value={form[field]} onChange={set(field)} required
              className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"
              placeholder={field === "password" ? "Min 8 chars, 1 uppercase, 1 number" : ""} />
          </div>
        ))}
        <div>
          <label className="mr-5 text-xs text-bgprimary mb-2 font-medium capitalize">Picture</label>
          <button type="button" onClick={() => {if(ref.current) ref.current.click()}}
                      className="w-1/3 bg-bgprimary hover:bg-bgprimary/80 disabled:opacity-50 text-primary font-semibold rounded-xl py-3 text-sm transition-colors"
            >Choose Picture</button>
          <input className="hidden" ref={ref} accept="image/*" type="file" onChange={e => {
              const file = e.target.files?.[0];

              if (!file) {
                setPicture("");
                setPreview("");
                return;
              }

              const reader = new FileReader();

              reader.onload = event => {
                const img = new Image();

                img.onload = () => {
                  const canvas = document.createElement("canvas");
                  const ctx = canvas.getContext("2d");

                  const SIZE = 200;

                  canvas.width = SIZE;
                  canvas.height = SIZE;

                  const size = Math.min(img.width, img.height);

                  const sx = (img.width - size) / 2;
                  const sy = (img.height - size) / 2;

                  ctx?.drawImage(
                      img,
                      sx,
                      sy,
                      size,
                      size,
                      0,
                      0,
                      200,
                      200
                  );

                  const resizedBase64 = canvas.toDataURL("image/jpeg", 0.5);

                  setPicture(resizedBase64);
                  setPreview(resizedBase64);
                };

                img.src = event.target?.result as string;
              };

              reader.readAsDataURL(file);
            }}
          />
          {preview && <img src={preview} className="mt-5 rounded-xl w-24 h-24 object-cover object-center aspect-square"/>}
        </div>
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
