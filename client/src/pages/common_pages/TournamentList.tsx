import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { TournamentDto } from "../../models/tournament/TournamentDto";
import { useNavigate } from "react-router-dom";
import { tournamentApi } from "../../api_services/tournament_list/TournamentAPIService";
import { Empty, ErrorBox, PageHeader, Pagination } from "../../components/ui/UI";
import { formatDeadline, daysUntilDeadline, getDeadlineStatus, getDeadlineColor } from '../../helpers/date_formatter';
import type { GameDto } from "../../models/game/GameDto";
import { gameApi } from "../../api_services/game_catalog/GameAPIService";
import { TournamentStatusValues, type TournamentStatus } from "../../types/tournament/TournamentStatus";
import { TournamentFormatValues, type TournamentFormat } from "../../types/tournament/TournamentFormat";
import type { TournamentFilterDto } from '../../models/tournament/TournamentFilterDto';

export default function TournamentList(){
    const { user } = useAuth();
    const [tournaments, setTournaments] = useState<TournamentDto[]>([]);
    const [error, setError] = useState<string>("");
    const [games, setGames] = useState<GameDto[]>([]);
    const [gameNameFilter, setGameNameFilter] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [formatFilter, setFormatFilter] = useState<string>("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();
    const limit = 12;

    const loadPage = (p : number) =>{
        tournamentApi.getAll(p, limit)
        .then(res => {
            if(res.success && res.data)
            {
                setTournaments(res.data?.items);
                setTotal(res.data.total);
            }
            else
            {
                setError(res.message);
                setTournaments([]);
            }
        })
        .catch(() => setError("Failed to load tournaments!"))

        gameApi.getAll()
        .then(res => {
            if (res.success) {
                setGames(res.data?.items ?? []);
                setError("");
            } else {
                setError(res.message ?? "Failed to load games");
                setGames([]);
            } 
        })
        .catch(() => setError("Failed to load games!"));
    }

    useEffect(() =>{
        loadPage(page);

    }, [page]);

    useEffect(() => {
        const filter: TournamentFilterDto = {
            tournamentGame: gameNameFilter === "" ? undefined : gameNameFilter,
            tournamentFormat: formatFilter === "" ? undefined : (formatFilter as TournamentFormat),
            tournamentStatus: statusFilter === "" ? undefined : (statusFilter as TournamentStatus)
        };
        tournamentApi.getFiltered(filter, page, limit)
        .then(res => {
            if(res.success && res.data)
            {
                setTournaments(res.data?.items ?? []);
                setTotal(res.data.total);
            }
                else
                setError(res.message);
        })
        .catch(() => setError("Failed to load tournaments!"))
    }, [gameNameFilter, statusFilter, formatFilter, page]);

    return(
        <div>
            <PageHeader eyebrow="" title="Tournament List" />
            <div className="flex justify-between gap-2 items-center mb-5">
                {user?.role === "admin" && (
                    <button onClick={() => navigate("/admin/tournament_list/add")}
                            className="mb-2 w-1/5  bg-bgsecondary/40 border-2 border-bgsecondary hover:bg-bgsecondary/30 text-bgsecondary font-semibold rounded-xl p-3 text-sm transition-colors">
                    Add Tournament</button>
                )}
                <div className="flex flex-row w-full gap-2">
                    <select 
                        value={gameNameFilter} 
                        onChange={(e) => setGameNameFilter(e.target.value)}
                        className="bg-bgprimary/10 border w-1/3 border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50">
                        <option value="" className='bg-lime-950'>
                            Any game
                        </option>
                        {games.map(game => (
                            <option className='bg-lime-950' key={game.gameId} value={game.gameName}>
                                {game.gameName}
                            </option>
                        ))}
                    </select>
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-bgprimary/10 w-1/3 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm focus:outline-none focus:border-white/30 transition-colors">
                        <option value="" className='bg-lime-950'>
                            Any status
                        </option>
                        {Object.entries(TournamentStatusValues).map(([key, value]) => (
                            <option className='bg-lime-950' key={key} value={value}>
                                {key}
                            </option>
                        ))}
                    </select>
                    <select 
                        value={formatFilter} 
                        onChange={(e) => setFormatFilter(e.target.value)}
                        className="bg-bgprimary/10 border w-1/3 border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm focus:outline-none focus:border-white/30 transition-colors">
                        <option value="" className='bg-lime-950'>
                            Any format
                        </option>
                        {Object.entries(TournamentFormatValues).map(([key, value]) => (
                            <option className='bg-lime-950' key={key} value={value}>
                                {key.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {error && <ErrorBox message={error}/>}
            {tournaments.length === 0 && !error ? <Empty message="No tournaments found"/> : (
                <section className="grid gap-5 sm:grid-cols-4 lg:grid-cols-4">
                    {tournaments.map(t => {
                        const days = daysUntilDeadline(t.tournamentApplicationDeadline);
                        const status = getDeadlineStatus(t.tournamentApplicationDeadline);
                        const color = getDeadlineColor(status);
                        
                        return (
                        <div className="border-2 border-bgsecondary bg-bgprimary/30 p-4 rounded-xl">
                            <h2 className="text-bgsecondary text-2xl font-bold">{t.tournamentName}</h2>
                            <p className="text-bgsecondary mb-3">{t.tournamentGame}</p>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-400 mb-0.5">Format:</p>
                                <p className="text-bgsecondary font-semibold mb-2">{t.tournamentFormat == "single_elimination" ? "SINGLE ELIMINATION" : t.tournamentFormat =="double_elimination" ? "DOUBLE ELIMINATION" : "ROUND ROBIN" }</p>
                            </div>
                            <div className="space-y-2 mb-3">
                                <p className="text-sm text-gray-400 mb-0.5">Deadline:</p>
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
                        </div>
                        );
                    })}
                </section>
            )}
            <Pagination page={page} total={total} pageSize={limit} onChange={setPage} />
        </div>
    );
}