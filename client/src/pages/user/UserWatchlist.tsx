import { useState, useEffect } from "react";
import { Empty, PageHeader, Pagination } from "../../components/ui/UI";
import type { UserWatchlistDto } from "../../models/user_watchlist/UserWatchlistDto";
import { userWatchlistApi } from '../../api_services/user_watchlist/UserWatchlistAPIService';
import { useAuth } from "../../hooks/auth/useAuthHook";

export default function UserWatchlist() {
    const { user } = useAuth();
    const [watchlist, setWatchlist] = useState<UserWatchlistDto[]>([]);
    const [error, setError] = useState<string>("");
    const [deleted, setDeleted] = useState<boolean>(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
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
                                <img src={w.gameLogotip} className="w-full sm:w-32 lg:w-40 aspect-square object-cover rounded-xl shrink-0 " />
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

                                        <div className="lg:col-start-3 flex justify-end">
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
                                                Remove from watchlist
                                            </button>
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