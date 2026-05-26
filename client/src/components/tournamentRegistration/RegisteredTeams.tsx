import { useEffect, useState } from "react";
import { Empty, ErrorBox, PageHeader, Pagination, Spinner } from "../ui/UI";
import type { TournamentRegistrationDto } from "../../models/tournamentRegistration/TournamentRegistrationDto";
import { TournamentRegistrationStatus } from "../../types/tournament_registration/TournamentRegistrationStatus";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { tournamentRegistrationApi } from "../../api_services/tournament_registration/TournamentRegistrationAPIService";
import { useNavigate, useParams } from "react-router-dom";
import { tournamentApi } from "../../api_services/tournament_list/TournamentAPIService";
import type { TournamentDto } from "../../models/tournament/TournamentDto";
import placeholder from "../../assets/placeholder.png"

export default function RegisteredTeams() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 20;
  const {id} = useParams();
  const [error, setError] = useState<string>("");
  const [confirmedTeams, setConfirmedTeams] = useState<TournamentRegistrationDto[]>([]);
  const [tournament, setTournament] = useState<TournamentDto>();
  const loadPage = (pages: number) => {
      
    Promise.resolve().then(() => setLoading(true));
    tournamentRegistrationApi.getByTournamentId(Number(id), TournamentRegistrationStatus.CONFIRMED, pages, limit)
    .then(res => {
      if (res.success && res.data) {
        setConfirmedTeams(res.data?.items);
        setTotal(res.data.total);
      }
      else
      {
        setError(res.message);
        setConfirmedTeams([]);
      }
    })
    tournamentApi.getById(Number(id))
    .then(res =>{
      if(res.success && res.data){
        setTournament(res.data);
      }
      else
        setError(res.message);
    })
    .finally(() => setLoading(false));
  };

  useEffect(() => {
      loadPage(page);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const Disqualify =async (tournamentId: number, teamId: number) =>{  
      await tournamentRegistrationApi.update(tournamentId, teamId, {status: TournamentRegistrationStatus.DISQUALIFIED})
      loadPage(page);
    }

  return (
    <div>
      <PageHeader eyebrow="" title="Registered Teams" />
      <p className="text-white">{confirmedTeams.length}/{tournament?.tournamentMaxTeams} teams registered</p>
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : confirmedTeams.length === 0 ? (
          <Empty message="No registered teams" />
        ) : (
          <>
            {error && <ErrorBox message={error} />}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {confirmedTeams.map((t, i) => (
                <div
                  key={t.teamId}
                  className="bg-primary border border-secondary/40 rounded-lg p-4 hover:border-secondary/60 transition-all duration-200 hover:shadow-lg hover:shadow-secondary/20"
                  onClick={() => navigate(`/teams/details/${t.teamId}`)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={t.teamLogotip? t.teamLogotip : placeholder}
                      alt={t.teamName}
                      className="w-12 h-12 rounded-lg object-cover border border-secondary/40"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-white truncate">
                        {t.teamName}
                      </h3>
                      <p className="text-xs text-white/50 font-mono">{t.teamTag}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-secondary/20">
                    <span className="text-xs text-white/40">
                      #{i + 1 + (page - 1) * limit}
                    </span>
                    {user?.role === "admin" && (
                      <button onClick={() => Disqualify(t.tournamentId, t.teamId)} className="cursor-pointer px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors duration-200">
                        Disqualify
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {Math.ceil(total / limit) > 1 && (
              <div className="mt-6">
                <Pagination
                  page={page}
                  total={total}
                  pageSize={limit}
                  onChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}