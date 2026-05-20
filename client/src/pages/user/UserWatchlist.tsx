import { useState, useEffect } from "react";
import { Empty, PageHeader, Pagination } from "../../components/ui/UI";
import type { UserWatchlistDto } from "../../models/user_watchlist/UserWatchlistDto";
import { userWatchlistApi } from '../../api_services/user_watchlist/UserWatchlistAPIService';
import { formatDeadline } from "../../helpers/date_formatter";
import { useAuth } from "../../hooks/auth/useAuthHook";

export default function UserWatchlist(){
    const {user} = useAuth();
    const [watchlist, setWatchlist] = useState<UserWatchlistDto[]>([]);
    const [error, setError] = useState<string>("");
    //const [deleted, setDeleted] = useState<boolean>(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;
    const id = user?.id ?? 0;

    useEffect(() => {
                    userWatchlistApi.getById(id, page, limit)
            .then(res => {
                if(res.success){
                    setWatchlist(res.data?.items ?? []);
                    setTotal(res.data?.total ?? 0);
                }
                else
                    setError(res.message);
            })
            .catch(() => setError("Failed to load watchlist"))
        }, [id, page]);
        return(
            <div>
            <PageHeader eyebrow="" title="My Watchlist"/>
            {watchlist.length === 0 && !error ? <Empty message="Nothing on your watchlist"/> : (
            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
               
                                {watchlist.map(w => (
                                <div className="group relative aspect-4/3 border-2 h-2xl border-white/5 bg-bgprimary/30  rounded-xl overflow-hidden">
                                    <div>
                                    <h2>Watchlist {w.userId} {w.tournamentName} {w.gameName}</h2>
                                    <p>{w.tournamentStatus}</p>
                                    </div>
                                    <div className="absolute rounded-t-lg bg-primary/90 h-min inset-0 origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300">
                                        <h2 className="text-bgsecondary text-center text-2xl font-bold">{w.userId}</h2>
                                    </div>
                                    <div className="absolute rounded-b-lg bottom-0 bg-primary/90 w-full p-2 origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300">
                                        
                                        <span className="float-left font-semibold text-sm text-bgsecondary">{w.tournamentId}</span>
                                        <span className="text-sm text-bgsecondary font-semibold float-right">{formatDeadline(w.addedAt)}</span>
                                    </div>
                                </div>
                                ))}
                            </section>
                        )}
                        <Pagination page={page} total={total} pageSize={limit} onChange={setPage} />
            </div>
        )

}