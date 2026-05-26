import { useEffect, useState } from "react";
import { Empty, ErrorBox, PageHeader, Pagination, Spinner } from "../ui/UI";
import { useParams } from "react-router-dom";
import { tournamentRegistrationApi } from "../../api_services/tournament_registration/TournamentRegistrationAPIService";
import type { TournamentRegistrationDto } from "../../models/tournamentRegistration/TournamentRegistrationDto";
import { TournamentRegistrationStatus } from "../../types/tournament_registration/TournamentRegistrationStatus";

export default function PendingTeams(){
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const limit = 20;
  const {id} = useParams();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [pendingTeams, setPendingTeams] = useState<TournamentRegistrationDto[]>([]); 

  const loadPage = (pages: number) => {
      
    Promise.resolve().then(() => setLoading(true));
    tournamentRegistrationApi.getByTournamentId(Number(id), TournamentRegistrationStatus.PENDING, pages, limit)
    .then(res => {
      if (res.success && res.data) {
        setPendingTeams(res.data?.items);
        setTotal(res.data.total);
      }
      else
      {
        setError(res.message);
        setPendingTeams([]);
      }
    })
    .finally(() => setLoading(false));
  };

  useEffect(() => {
      loadPage(page);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const Add = async (tournamentId: number, teamId: number) => {
      setError("");
      setSuccess("");
      setIsProcessing(true);
      try {
        const res = await tournamentRegistrationApi.update(tournamentId, teamId, {status: TournamentRegistrationStatus.CONFIRMED});
        if (res.success) {
          setSuccess("Team successfully confirmed!");
          setTimeout(() => setSuccess(""), 3000);
          loadPage(page);
        } else {
          setError(res.message ?? "Failed to confirm team");
        }
      } catch (err) {
        setError("Failed to confirm team: " + err);
      } finally {
        setIsProcessing(false);
      }
    }

    const Disqualify = async (tournamentId: number, teamId: number) => {
      setError("");
      setSuccess("");
      setIsProcessing(true);
      try {
        const res = await tournamentRegistrationApi.update(tournamentId, teamId, {status: TournamentRegistrationStatus.DISQUALIFIED});
        if (res.success) {
          setSuccess("Team successfully disqualified!");
          setTimeout(() => setSuccess(""), 3000);
          loadPage(page);
        } else {
          setError(res.message ?? "Failed to disqualify team");
        }
      } catch (err) {
        setError("Failed to disqualify team: " + err);
      } finally {
        setIsProcessing(false);
      }
    }

  return (
    <div>
      <PageHeader eyebrow="" title="Pending Teams" />
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : pendingTeams.length === 0 ? (
          <Empty message="No pending teams" />
        ) : (
          <>
            {error && <ErrorBox message={error} />}
            {success && (
              <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-4">
                <p className="text-green-400 font-medium">{success}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingTeams.map((t, i) => (
                <div
                  key={t.teamId}
                  className="bg-primary border border-secondary/40 rounded-lg p-4 hover:border-secondary/60 transition-all duration-200 hover:shadow-lg hover:shadow-secondary/20"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={t.teamLogotip}
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
                      <button 
                        onClick={() => Add(t.tournamentId, t.teamId)} 
                        disabled={isProcessing}
                        className="px-3 py-1 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isProcessing ? "Processing..." : "Add"}
                      </button>
                      <button 
                        onClick={() => Disqualify(t.tournamentId, t.teamId)} 
                        disabled={isProcessing}
                        className="cursor-pointer px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isProcessing ? "Processing..." : "Disqualify"}
                      </button>
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