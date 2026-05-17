import { useEffect, useState } from "react";
import { Empty, ErrorBox, PageHeader, Pagination, Spinner, Table, TableHead } from "../ui/UI";
import type { TournamentRegistrationDto } from "../../models/tournamentRegistration/TournamentRegistrationDto";
import { TournamentRegistrationStatus } from "../../types/tournament_registration/TournamentRegistrationStatus";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { tournamentRegistrationApi } from "../../api_services/tournament_registration/TournamentRegistrationAPIService";
import { useParams } from "react-router-dom";

export default function RegisteredTeams() {
  const { user } = useAuth();
  const [regTeams, setRegTeams] = useState<TournamentRegistrationDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 20;
  const {id} = useParams();
  const [error, setError] = useState<string>("");


  const loadPage = (pages: number) => {
      
    Promise.resolve().then(() => setLoading(true));
  
    tournamentRegistrationApi.getByTournamentId(Number(id), pages, limit)
    .then(res => {
      if (res.success && res.data) {
        setRegTeams(res.data?.items);
        setTotal(res.data.total);
      }
      else
      {
        setError(res.message);
        setRegTeams([]);
      }
    })
    .finally(() => setLoading(false));
  };

  useEffect(() => {
      loadPage(page);
    }, [page]);

  return (
    <div>
      <PageHeader eyebrow="" title="Registered Teams" />
      <div className="space-y-4">
        <div className="bg-primary border border-secondary/40 rounded-xl p-6">
          {loading ? <div className="flex justify-center py-16"><Spinner /></div>
                  : regTeams.length === 0 ? <Empty message="No registered teams" />
                  : <>
            {error && <ErrorBox message={error}/>}
            <Table>
              <TableHead columns={["Logo", "Team name", "Team tag"]} />
              <tbody>
                {regTeams
                  .filter(t => t.status === TournamentRegistrationStatus.CONFIRMED)
                  .map((t, i) => (
                  <tr key={t.teamId} className={`hover:bg-white/2 transition-colors ${i < regTeams.length - 1 ? "border-b border-white/4" : ""}`}>
                    <td className="px-5 py-3.5 font-mono text-xs text-white/20"><img src={t.teamLogotip} /></td>
                    <td className="px-5 py-3.5 font-mono text-xs text-white/20">{t.teamName}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-white/20">{t.teamTag}</td>
                    {user?.role === "admin" && (
                    <td className="px-5 py-3.5 font-mono text-xs text-white/20"><button>DISQUALIFY</button></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={page} total={total} pageSize={limit} onChange={setPage} />
            </>}
        </div>
      </div>
    </div>
  );
}