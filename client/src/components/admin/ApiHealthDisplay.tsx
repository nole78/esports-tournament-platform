import { useEffect, useState } from "react";
import { healthApi } from "../../api_services/health/HealthAPIService";
import { ErrorBox, NodeBadge, PageHeader, Spinner, SuccessBox } from "../ui/UI";
import type { ApiStatusDto } from "../../models/health/ApiStatusDto";


export default function ApiHealthDisplay(){
    const [status, setStatus] = useState<ApiStatusDto[]>([]);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    
    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await healthApi.getApiStatus();
            if (res.success && res.data) 
            {
                setStatus(res.data);
                setSuccess("Succesfully refreshed API health status");
                setTimeout(() => {
                setSuccess("");
                }, 3000);
            }
            else
                setError(res?.message)
        }
        catch{
            setError("Coudnt't load API health status");
        }
        finally {
            setLoading(false);
        }
    };
    
    useEffect(() => { 
        load();
    }, []);

    return(
        <>
        <PageHeader eyebrow="" title="Api Health"
        action={
            <button onClick={load} disabled={loading}
                className="mb-2 bg-bgsecondary/40 border-2 border-bgsecondary hover:bg-bgsecondary/30 text-bgsecondary font-semibold rounded-xl p-3 text-sm transition-colors">
                {loading ? <><Spinner size={12} /> Refreshing…</> : "Refresh"}
            </button>
        } />

        {success && <SuccessBox message={success}/>}
        {error && <ErrorBox message={error}/>}

        {status && (
        <>
          <div className="flex flex-col gap-3">
            {status.map(n => (
              <div key={n.name} className="bg-white/2 border border-white/6 rounded-2xl px-6 py-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium text-white">{n.name}</span>
                    <NodeBadge status={n.status} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <p className="text-white/20 uppercase tracking-wider text-[10px] mb-1.5">Last check</p>
                    <p className="text-white/40">{n.lastCheck ? new Date(n.lastCheck).toLocaleTimeString() : "—"}</p>
                  </div>
                  <div>
                    <p className="text-white/20 uppercase tracking-wider text-[10px] mb-1.5">Latency</p>
                    <p className="text-white/40">{n.latency !== -1 ? `${n.latency} ms` : "None"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
        </>
    );
}