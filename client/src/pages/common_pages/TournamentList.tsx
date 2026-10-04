import { useState } from "react";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { useNavigate } from "react-router-dom";
import { tournamentApi } from "../../api_services/tournament_list/TournamentAPIService";
import { Empty, ErrorBox, PageHeader, Pagination } from "../../components/ui/UI";
import { formatDeadline, daysUntilDeadline, getDeadlineStatus, getDeadlineColor } from '../../helpers/date_formatter';
import { gameApi } from "../../api_services/game_catalog/GameAPIService";
import { TournamentStatus } from "../../types/tournament/TournamentStatus";
import { TournamentFormat } from "../../types/tournament/TournamentFormat";
import { Button } from "../../components/ui/Button";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";

export default function TournamentList(){
    const { user } = useAuth();
    const [actionError, setActionError] = useState<string>("");
    const [gameNameFilter, setGameNameFilter] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [formatFilter, setFormatFilter] = useState<string>("");
    const [page, setPage] = useState(1);
    const navigate = useNavigate();
    const limit = 12;
    const userId = user?.id ?? 0;
    const queryClient = useQueryClient();

    const {data: tournamentData, isLoading, error} = useQuery({
        queryKey: ["tournaments", page],
        queryFn: async () => {
            return tournamentApi.getAll(page, limit)
            .then(res => {
                if(!res.success)
                {
                    throw new Error(res.message ?? "Request failed");
                }
                return res.data;
            })
            .catch(() => {throw new Error("Failed to load tournaments!")})
        },
        placeholderData: keepPreviousData
    })

    const {data: gameNamesData} = useQuery({
        queryKey: ["gameNames"],
        queryFn: async () => {
            return gameApi.getAllNames()
            .then(res => {
                if (!res.success) {
                    throw new Error(res.message ?? "Failed to load games");
                }
                return res.data;
            })
            .catch(() => {
                throw new Error("Failed to load games!");
            });
        },
        placeholderData: keepPreviousData
    })

    const gameNames = gameNamesData?.gameNames || []
    const tournaments = tournamentData?.items || []
    const total = tournamentData?.total || 0
    const errorMessage = error instanceof Error? error.message : (actionError || "")
    

    /*useEffect(() => {
        const filter: TournamentFilterDto = {
            tournamentGame: gameNameFilter === "" ? "" : gameNameFilter,
            tournamentFormat: formatFilter === "" ? "" : formatFilter,
            tournamentStatus: statusFilter === "" ? "" : statusFilter
        };
        tournamentApi.getFiltered(filter, page, limit)
        .then(res => {
            if(res.success && res.data)
            {
                //setTournaments(res.data?.items ?? []);
                //setTotal(res.data.total);
            }
                else
                setActionError(res.message ?? "Request failed");
        })
        .catch(() => setActionError("Failed to load tournaments!"))
    }, [gameNameFilter, statusFilter, formatFilter, page]);*/

    return(
        <div>
            <PageHeader eyebrow="" title="Tournament List" />
            <div className="flex justify-between gap-2 items-center mb-5">
                {user?.role === "admin" && (
                    <Button variant="secondary" className="mb-2" onClick={() => navigate("/admin/tournament_list/add")}>
                        Add Tournament
                    </Button>
                )}
                <div className="flex flex-row w-full gap-2">
                    <select 
                        value={gameNameFilter} 
                        onChange={(e) => setGameNameFilter(e.target.value)}
                        aria-label="Filter tournaments by game"
                        className="control w-1/3 px-4 py-3 text-sm">
                        <option value="" className='bg-lime-950'>
                            Game
                        </option>
                        { gameNames.map(gameName => (
                            <option className='bg-lime-950' key={gameName} value={gameName}>
                                {gameName}
                            </option>
                        ))}
                    </select>
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        aria-label="Filter tournaments by status"
                        className="control w-1/3 px-4 py-3 text-sm">
                        <option value="" className='bg-lime-950'>
                            Status
                        </option>
                        {Object.entries(TournamentStatus).map(([key, value]) => (
                            <option className='bg-lime-950' key={key} value={value}>
                                {key}
                            </option>
                        ))}
                    </select>
                    <select 
                        value={formatFilter} 
                        onChange={(e) => setFormatFilter(e.target.value)}
                        aria-label="Filter tournaments by format"
                        className="control w-1/3 px-4 py-3 text-sm">
                        <option value="" className='bg-lime-950'>
                            Format
                        </option>
                        {Object.entries(TournamentFormat).map(([key, value]) => (
                            <option className='bg-lime-950' key={key} value={value}>
                                {key.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {errorMessage ? (
                <ErrorBox message={errorMessage}/>
            ):
            isLoading ? (
                <p>Loading...</p>
            ) :
            tournaments.length === 0? (
                <Empty message="No tournaments found"/> 
            ) : (
                <section className="grid gap-5 sm:grid-cols-4 lg:grid-cols-4">
                    {tournaments.map(t => {
                        const days = daysUntilDeadline(t.tournamentApplicationDeadline);
                        const status = getDeadlineStatus(t.tournamentApplicationDeadline);
                        const color = getDeadlineColor(status);
                        
                        return (
                            <article className="surface flex cursor-pointer flex-col p-5 transition-shadow duration-200 hover:shadow-lg hover:shadow-secondary/20" key={t.tournamentId}>
                                <button type="button" className="text-left" onClick={() => navigate(`/tournament_registration/${t.tournamentId}`)}>
                                    <h2 className="text-bgsecondary text-2xl font-bold">{t.tournamentName}</h2>
                                    <p className="text-bgsecondary mb-3">{t.tournamentGame}</p>
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-400 mb-0.5">Format:</p>
                                        <p className="text-bgsecondary font-semibold mb-2">{t.tournamentFormat == "single_elimination" ? "SINGLE ELIMINATION" : t.tournamentFormat =="double_elimination" ? "DOUBLE ELIMINATION" : "ROUND ROBIN" }</p>
                                    </div>
                                    <div className="space-y-2 mb-3">
                                        <p className="text-sm text-gray-400 mb-0.5">Application deadline:</p>
                                        <div className="flex justify-between items-center">
                                            <p className="text-bgsecondary font-semibold">{formatDeadline(t.tournamentApplicationDeadline)}</p>
                                            <p className={`text-sm font-bold ${color}`}>
                                                {days < 0 ? "Expired" : days === 0 ? "Today!" : days === 1 ? "Tomorrow" : days <= 7 ? `${days} days` : `${days} days`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="text-bgsecondary">{t.tournamentMaxTeams} teams</p>
                                        <p className="text-bgsecondary">Prize: {t.tournamentPrizeFund}$</p>
                                    </div>
                                    <p className="text-bgsecondary">{t.tournamentStatus}</p>
                                </button>
                                {user?.role === "admin" || user?.role === "player" ? 
                                <div className="mt-auto">
                                <br></br>
                                    <button
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();

                                            try {
                                                if (t.isWatchlisted) {
                                                    const res = await tournamentApi.removeFromWatchList(
                                                        t.tournamentId,
                                                        userId
                                                    );

                                                    if (res.success) {
                                                        // change toutnament watchlsited state
                                                        queryClient.invalidateQueries({ queryKey: ["tournaments"]})
                                                    }
                                                } else {
                                                    const res = await tournamentApi.addToWatchList(
                                                        t.tournamentId,
                                                        userId
                                                    );

                                                    if (res.success) {
                                                        // change toutnament watchlsited state
                                                        queryClient.invalidateQueries({ queryKey: ["tournaments"]})
                                                    }
                                                }
                                            } catch {
                                                setActionError("Failed to update watchlist!");
                                            }
                                        }}
                                        className={`min-h-11 w-full rounded-xl p-2 text-sm font-semibold transition-colors
                                        ${
                                            t.isWatchlisted
                                                ? "bg-red-400/40 border-2 border-red-500 hover:bg-bgsecondary/30 hover:border-bgsecondary text-red-500 font-semibold"
                                                : "bg-green-400/40 border-2 border-green-500 hover:bg-bgsecondary/30 hover:border-bgsecondary text-green-500 font-semibold"
                                        }`}
                                        >
                                        {t.isWatchlisted
                                            ? "Remove from watchlist"
                                            : "Add to watchlist"}
                                    </button></div> : null}
                            </article>
                        );
                    })}
                </section>
            )}
            <Pagination page={page} total={total} pageSize={limit} onChange={setPage} />
        </div>
    );
}