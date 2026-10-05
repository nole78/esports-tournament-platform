import { useState } from "react";
import { auditLogApi } from "../../api_services/audit_log/AuditLogAPIService";
import { Spinner, Empty, Pagination, Table, TableHead, PageHeader, ErrorBox } from "../../components/ui/UI";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error} = useQuery({
    queryKey: ["audit", page],
    queryFn: async () => {
      return auditLogApi.getLogs(page, limit)
      .then((res) => {
        if (!res.success) {
          throw new Error(res.message || "Failed to load logs")
        }
        return res.data;
      })
      .catch(() => { throw new Error("Failed to load logs")})
    },
    placeholderData: keepPreviousData
  })

  const logs = data?.items || [];
  const total = data?.total || 0;

  return (
    <div>
      <PageHeader eyebrow="admin" title="Audit Log" />
      {error? (
        <ErrorBox message={error.message}/>
      ) :
      isLoading ? ( 
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : 
      logs.length === 0 ? (
      <Empty message="No log entries" />
      ) : 
        <>
          <Table>
            <TableHead columns={["#", "Gamer Tag", "Action", "Entity", "IP", "Time"]} />
            <tbody>
              {logs.map((l, i) => (
                <tr key={l.id} className={`hover:bg-white/2 transition-colors ${i < logs.length - 1 ? "border-b border-white/4" : ""}`}>
                  <td className="px-5 py-3.5 font-mono text-xs text-white/20">{l.id}</td>
                  <td className="px-5 py-3.5 text-xs text-white/50">{l.gamer_tag ? ` ${l.gamer_tag}` : <span className="text-white/20">Unregistered user</span>}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-amber-400/70">{l.action}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-white/30">
                    {l.entity ? `${l.entity}${l.entityId ? ` #${l.entityId}` : " —"}` : <span className="text-white/15">—</span>}
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
