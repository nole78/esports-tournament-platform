import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { healthApi } from "../../api_services/health/HealthAPIService";
import type { HealthStatusDto } from "../../models/health/HealthStatusDto";
import { Spinner, NodeBadge, PageHeader } from "../../components/ui/UI";

export default function HealthPage() {
  const { token } = useAuth();
  const [status, setStatus] = useState<HealthStatusDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await healthApi.getDbStatus(token);
      if (res.success && res.data) setStatus(res.data);
    }
    finally {
      setLoading(false);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [token]);


  const runCheck = async () => {
    if (!token) return;

    setChecking(true);
    setMsg("");

    try {
        const res = await healthApi.runCheck(token);

        console.log("RUN CHECK RESPONSE:", res);

        if (res.success && res.data) {
            setStatus(res.data);
            setMsg("Health check completed.");
            setTimeout(() => {
                setMsg("");
                }, 3000);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setChecking(false);
    }
};

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;

  return (
    <div>
      <PageHeader eyebrow="admin" title="Database Health"
        action={
          <button onClick={runCheck} disabled={checking}
            className="mb-2 bg-bgsecondary/40 border-2 border-bgsecondary hover:bg-bgsecondary/30 text-bgsecondary font-semibold rounded-xl p-3 text-sm transition-colors">
            {checking ? <><Spinner size={12} /> Checking…</> : "Run check"}
          </button>
        } />

      {msg && <div className="mb-6 text-xs font-mono text-amber-400/60 border border-amber-500/20 bg-amber-500/10 px-4 py-3 rounded-xl">{msg}</div>}

      {status && (
        <>
          <p className="text-xs text-white/20 font-mono mb-5">Round-Robin index: <span className="text-white/40">{status.rrIndex}</span></p>
          <div className="flex flex-col gap-3">
            {status.nodes.map(n => (
              <div key={n.name} className="bg-white/2 border border-white/6 rounded-2xl px-6 py-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium text-white">{n.name}</span>
                    <NodeBadge status={n.status} />
                  </div>
                  <span className="text-xs font-mono text-white/25">{n.host}:{n.port}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <p className="text-white/20 uppercase tracking-wider text-[10px] mb-1.5">Successful writes</p>
                    <p className="text-emerald-400">{n.successfulWrites}</p>
                  </div>
                  <div>
                    <p className="text-white/20 uppercase tracking-wider text-[10px] mb-1.5">Failed writes</p>
                    <p className="text-red-400">{n.failedWrites}</p>
                  </div>
                  <div>
                    <p className="text-white/20 uppercase tracking-wider text-[10px] mb-1.5">Last check</p>
                    <p className="text-white/40">{n.lastCheck ? new Date(n.lastCheck).toLocaleTimeString() : "—"}</p>
                  </div>
                  <div>
                    <p className="text-white/20 uppercase tracking-wider text-[10px] mb-1.5">Latency</p>
                    <p className="text-white/40">{n.latency !== undefined ? `${n.latency} ms` : "—"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
