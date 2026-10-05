import { useState } from "react";
import { Empty, ErrorBox, PageHeader, Pagination, Spinner } from "../ui/UI";
import { TournamentRegistrationStatus } from "../../types/tournament_registration/TournamentRegistrationStatus";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { tournamentRegistrationApi } from "../../api_services/tournament_registration/TournamentRegistrationAPIService";
import { useNavigate, useParams } from "react-router-dom";
import placeholder from "../../assets/placeholder.png"
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { tournamentApi } from "../../api_services/tournament_list/TournamentAPIService";

export default function RegisteredTeams() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 20;
  const {id} = useParams();
  const [actionError, setActionError] = useState<string>("");
  const queryClinet = useQueryClient();

  const { data, isLoading, error} = useQuery({
    queryKey: ["registered_teams", page],
    queryFn: async () => {
      return tournamentRegistrationApi.getByTournamentId(Number(id), TournamentRegistrationStatus.CONFIRMED, page, limit)
      .then(res => {
        if (!res.success)
        {
          throw new Error(res.message ?? "Failed to get teams");
        }
        return res.data;
      })
      .catch(() => { throw new Error("Failed to get teams")})
    },
    placeholderData: keepPreviousData
  })

  const { data: tournamentData, error: tournamentError} = useQuery({
    queryKey: ["tournament"],
    queryFn: async () => {
      return tournamentApi.getById(Number(id))
      .then(res => {
        if(!res.success)
        {
          throw new Error(res.message || "Failed to get tournament info")
        }
        return res.data;
      })
      .catch(() => { throw new Error("Failed to get tournament info")})
    },
    placeholderData: keepPreviousData
  })

  const confirmedTeams = data?.items || [];
  const total = data?.total || 0;
  const tournament = tournamentData;

    const Disqualify = async (tournamentId: number, teamId: number) =>{  
      await tournamentRegistrationApi.update(tournamentId, teamId, {status: TournamentRegistrationStatus.DISQUALIFIED})
      .then(res => {
        if(!res.success)
        {
          setActionError(res.message || "Failed to disqualify team")
        }
        queryClinet.invalidateQueries({queryKey:["egistered_teams"]});
      })
      .catch(() => setActionError("Failed to disqualify team"));
    }

  return (
    <div>
      <PageHeader eyebrow="" title="Registered Teams" />
      {tournamentError? (
        <ErrorBox message={tournamentError.message}/>
      ) : (
      <>
        <p className="text-white">{confirmedTeams.length}/{tournament?.tournamentMaxTeams} teams registered</p>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : confirmedTeams.length === 0 ? (
            <Empty message="No registered teams" />
          ) : (
            <>
              {actionError && <ErrorBox message={actionError} />}
              {error? (
                <ErrorBox message={error.message}/>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {confirmedTeams.map((t, i) => (
                    <div
                      key={t.teamId}
                      className="bg-primary border border-secondary/40 rounded-lg p-4 hover:border-secondary/60 transition-all duration-200 hover:shadow-lg hover:shadow-secondary/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/teams/details/${t.teamId}`)}}
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
              )}
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
      </>
      )}
    </div>
  );
}