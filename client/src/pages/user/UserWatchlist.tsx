import { useState, useEffect } from "react";
import { Empty, PageHeader, Pagination } from "../../components/ui/UI";
import type { UserWatchlistDto } from "../../models/user_watchlist/UserWatchlistDto";
import { userWatchlistApi } from '../../api_services/user_watchlist/UserWatchlistAPIService';
import { useAuth } from "../../hooks/auth/useAuthHook";
import { useNavigate } from "react-router-dom";
import placeholder from "../../assets/placeholder.png";

export default function UserWatchlist() {
    const { user } = useAuth();
    const [watchlist, setWatchlist] = useState<UserWatchlistDto[]>([]);
    const [error, setError] = useState<string>("");
    const [deleted, setDeleted] = useState<boolean>(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();
    const limit = 20;
    const id = user?.id ?? 0;

    useEffect(() => {
        userWatchlistApi.getById(id, page, limit)
            .then(res => {
                if (res.success) {
                    setWatchlist(res.data?.items ?? []);
                    setTotal(res.data?.total ?? 0);
                }
                else
                    setError(res.message);
            })
            .catch(() => setError("Failed to load watchlist"))
    }, [id, page]);
    return (
        <div>
            <PageHeader eyebrow="" title="My Watchlist" />
            {deleted && (
                <div className="mb-5 bg-green-500/10 border border-green-500/20 text-green-300 text-sm px-4 py-3 rounded-xl">
                    Succesfully removed an item from your watchlist
                </div>
            )}
            {watchlist.length === 0 && !error ? <Empty message="Nothing on your watchlist" /> : (
                <section className="grid gap-5 sm:grid-cols-1 lg:grid-cols-1">
                    {watchlist.map(w => (
                        <div key={w.tournamentName} className="bg-white/2 border border-white/6 rounded-2xl p-4 sm:p-5 lg:p-6 relative">
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                <div className="overflow-hidden rounded-xl shrink-0 w-full sm:w-32 lg:w-40">
                                    <a onClick={() => user?.role == "admin" ? navigate(`/admin/tournament_registration/${w.tournamentId}`) : navigate(`/tournament_registration/${w.tournamentId}`)}>
                                    <img src={w.gameLogotip ? w.gameLogotip : placeholder} className="w-full aspect-square object-cover rounded-xl cursor-pointer transition-transform duration-300 hover:scale-110"/>
                                    </a>
                                </div>
                                <div className="flex flex-col lg:gap-10 sm:gap-10 overflow-hidden">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:gap-10 lg:gap-25 text-xs font-mono">

                                        <div className="min-w-0">
                                            <p className="text-white/20 uppercase tracking-wider text-[15px] mb-1.5">
                                                Tournament Name
                                            </p>
                                            <p className="text-bgsecondary wrap-break-words text-[15px]">
                                                {w.tournamentName}
                                            </p>
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-white/20 uppercase tracking-wider text-[15px] mb-1.5">
                                                Tournament Status
                                            </p>
                                            <p className="text-bgsecondary wrap-break-words text-[15px]">
                                                {w.tournamentStatus}
                                            </p>
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-white/20 uppercase tracking-wider text-[15px] mb-1.5">
                                                Added to watchlist
                                            </p>
                                            <p className="text-white/40 wrap-break-words">
                                                {w.addedAt ? new Date(w.addedAt).toLocaleString(): "—"}
                                            </p>
                                        </div>

                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-xs font-mono items-end">

                                        <div className="min-w-0">
                                            <p className="text-white/20 uppercase tracking-wider text-[15px] mb-1.5">
                                                Game Name
                                            </p>

                                            <p className="text-bgsecondary wrap-break-word text-[15px]">
                                                {w.gameName}
                                            </p>
                                        </div>

                                        <div className="relative group flex lg:justify-center sm:justify-end lg:col-start-3">
                                            <button
                                                className="cursor-pointer w-1/3 min-w-30 bg-red-400/40 border-2 border-red-500 hover:bg-bgsecondary/30 hover:border-bgsecondary text-red-500 font-semibold rounded-xl p-1 text-sm transition-colors"
                                                
                                                onClick={() => {
                                                    setDeleted(false);
                                                    userWatchlistApi.delete(w.userId, w.tournamentId)
                                                        .then(res => {
                                                            if (res.success) {
                                                                setDeleted(true);
                                                                setWatchlist(prev =>
                                                                    prev.filter(
                                                                        watchlist =>
                                                                            watchlist.tournamentId !== w.tournamentId
                                                                    )
                                                                );
                                                                setTimeout(() => {
                                                                    setDeleted(false);
                                                                }, 3000);
                                                                return;
                                                            }
                                                            setError(res.message);
                                                        })
                                                        .catch(() =>
                                                            setError("Failed to remove tournament from watchlist")
                                                        );
                                                }}
                                            >
                                                Remove
                                            </button>
                                            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md bg-bgsecondary/30 px-2 py-1 text-xs text-bgsecondary opacity-0 transition-opacity duration-200 group-hover:opacity-100 whitespace-nowrap">
                                                Remove item from watchlist
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            )}
            <Pagination page={page} total={total} pageSize={limit} onChange={setPage} />
        </div>
    )

}