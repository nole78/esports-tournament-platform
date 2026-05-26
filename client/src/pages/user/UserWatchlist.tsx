import { useState, useEffect } from "react";
import { Empty, PageHeader, Pagination, Table, TableHead } from "../../components/ui/UI";
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
                <>
                    <Table>
                        <TableHead columns={["Logo", "Tournament Name", "Game Name", "Status", "Added At", "Action"]} />
                        <tbody>
                            {watchlist.map(w => (
                                <tr key={w.tournamentId} className="border-b border-secondary/50 hover:bg-bgprimary/20 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/tournament_registration/${w.tournamentId}`)}>
                                    
                                    <td className="px-5 py-4">
                                        <img src={w.gameLogotip ?? placeholder} alt={w.gameName} className="w-12 h-12 rounded object-cover" />
                                    </td>
                                    <td className="px-5 py-4 text-sm text-bgsecondary">
                                            {w.tournamentName}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-bgsecondary">{w.gameName}</td>
                                    <td className="px-5 py-4 text-sm text-bgsecondary">{w.tournamentStatus}</td>
                                    <td className="px-5 py-4 text-sm text-white/60">{w.addedAt ? new Date(w.addedAt).toLocaleString() : "—"}</td>
                                    
                                    <td className="px-5 py-4 text-sm">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();

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
                                            className="cursor-pointer px-3 py-1 bg-red-400/40 border border-red-500 hover:bg-red-500/20 text-red-400 font-semibold rounded-lg text-xs transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Pagination page={page} total={total} pageSize={limit} onChange={setPage} />
                </>
            )}
        </div>
    )

}