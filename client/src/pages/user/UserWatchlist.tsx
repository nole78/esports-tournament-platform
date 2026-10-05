import { useState } from "react";
import { Empty, ErrorBox, PageHeader, Pagination, Spinner, Table, TableHead } from "../../components/ui/UI";
import { userWatchlistApi } from '../../api_services/user_watchlist/UserWatchlistAPIService';
import { useAuth } from "../../hooks/auth/useAuthHook";
import { useNavigate } from "react-router-dom";
import placeholder from "../../assets/placeholder.png";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";

export default function UserWatchlist() {
    const { user } = useAuth();
    const [actionError, setActionError] = useState<string>("");
    const [deleted, setDeleted] = useState<boolean>(false);
    const [page, setPage] = useState(1);
    const navigate = useNavigate();
    const limit = 20;
    const id = user?.id ?? 0;
    const queryClient = useQueryClient();

    const {data, isLoading, error} = useQuery({
        queryKey: ["watchlist", page],
        queryFn: async () => {
            return userWatchlistApi.getById(id, page, limit)
            .then(res => {
                if (!res.success) {
                    throw new Error(res.message ?? "Failed to load watchlist");
                }
                return res.data;
            })
            .catch(() => {throw new Error("Failed to load watchlist")})
        },
        placeholderData: keepPreviousData
    })

    const watchlist = data?.items || [];
    const total = data?.total || 0;

    return (
        <div>
            <PageHeader eyebrow="" title="My Watchlist" />
            {deleted && (
                <div className="mb-5 bg-green-500/10 border border-green-500/20 text-green-300 text-sm px-4 py-3 rounded-xl">
                    Succesfully removed an item from your watchlist
                </div>
            )}
            {actionError &&
                <ErrorBox message={actionError}/>
            }
            {error ? (
                <ErrorBox message={error.message}/> 
            ):
            isLoading ? (
                <div className="flex justify-center py-16">
                    <Spinner />
                </div> 
            ) :
            watchlist.length === 0 ? (
                <Empty message="Nothing on your watchlist" /> 
            ) : (
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
                                                            queryClient.invalidateQueries({queryKey: ["watchlist"]});
                                                            setTimeout(() => {
                                                                setDeleted(false);
                                                            }, 3000);
                                                            return;
                                                        }
                                                        setActionError(res.message ?? "Failed to remove watchlist item");
                                                    })
                                                    .catch(() =>
                                                        setActionError("Failed to remove tournament from watchlist")
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