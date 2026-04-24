import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { auditLogApi } from "../../api_services/audit_log/AuditLogAPIService";
import type { AuditLogDto } from "../../models/audit/AuditLogDTO";
import { Spinner, Empty, Pagination, Table, TableHead, PageHeader } from "../../components/ui/UI";

export default function AuditLogPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const load = (p: number) => {
    if (!token) return;
    
    Promise.resolve().then(() => setLoading(true));

    auditLogApi.getLogs(token, p, limit)
      .then((res) => {
        if (res.success && res.data) {
          setLogs(res.data.items);
          setTotal(res.data.total);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, token]);


  return (
    <div>
      <PageHeader eyebrow="admin" title="Audit Log" />
      {loading ? <div className="flex justify-center py-16"><Spinner /></div>
        : logs.length === 0 ? <Empty message="No log entries" />
        : <>
          <Table>
            <TableHead columns={["#", "Gamer Tag", "Action", "Entity", "IP", "Time"]} />
            <tbody>
              {logs.map((l, i) => (
                <tr key={l.id} className={`hover:bg-white/2 transition-colors ${i < logs.length - 1 ? "border-b border-white/4" : ""}`}>
                  <td className="px-5 py-3.5 font-mono text-xs text-white/20">{l.id}</td>
                  <td className="px-5 py-3.5 text-xs text-white/50">{l.gamer_tag ?? <span className="text-white/20">—</span>}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-amber-400/70">{l.action}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-white/30">
                    {l.entity ? `${l.entity}${l.entityId ? ` #${l.entityId}` : ""}` : <span className="text-white/15">—</span>}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-white/20">{l.ipAddress ?? "—"}</td>
                  <td className="px-5 py-3.5 text-xs text-white/30">{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={page} total={total} pageSize={limit} onChange={setPage} />
        </>}
    </div>
  );
}
